import { Firehose } from "@atproto/sync";
import { IdResolver } from "@atproto/identity";
import supabase from "./utils/db.js";

const MENTAL_HEALTH_KEYWORDS = [
  "mental health",
  "mental illness",
  "mental disorder",
  "mental breakdown",
  "mental fatigue",
  "psychological",
  "emotional health",
  "emotional support",
  "cognitive therapy",
  "psychotherapy",
  "clinical depression",
  "depression",
  "depressed",
  "hopeless",
  "worthless",
  "numb",
  "empty",
  "crying",
  "grief",
  "mourning",
  "loss",
  "low mood",
  "burnout",
  "anxiety",
  "anxious",
  "panic attack",
  "panic disorder",
  "worry",
  "nervous",
  "overwhelmed",
  "racing thoughts",
  "dread",
  "tension",
  "suicide",
  "suicidal",
  "self harm",
  "cutting",
  "attempted suicide",
  "taking my life",
  "ending it all",
  "thoughts of suicide",
  "hurting myself",
  "ptsd",
  "trauma",
  "flashbacks",
  "hypervigilance",
  "dissociation",
  "emotional numbness",
  "abuse trauma",
  "childhood trauma",
  "sexual trauma",
  "bipolar",
  "ocd",
  "adhd",
  "borderline",
  "schizophrenia",
  "eating disorder",
  "anorexia",
  "bulimia",
  "personality disorder",
  "therapy",
  "counseling",
  "counsellor",
  "therapist",
  "psychologist",
  "psychiatrist",
  "meds",
  "mental health treatment",
  "support group",
  "recovery",
  "mental health app",
  "insomnia",
  "sleep disorder",
  "can’t sleep",
  "racing mind",
  "stressed",
  "stress",
  "burned out",
  "sleep paralysis",
  "i want to die",
  "i want to end it",
  "i can’t do this anymore",
  "life isn’t worth it",
  "no reason to live",
  "ending my life",
];

// Precompile keyword regexes
const mentalHealthRegexes = MENTAL_HEALTH_KEYWORDS.map(
  (kw) =>
    new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i")
);

const isMentalHealthPost = (() => {
  const cache = new Map(); // LRU-like in-memory cache (very lightweight)
  return (text = "") => {
    if (cache.has(text)) return cache.get(text);
    const match = mentalHealthRegexes.some((regex) => regex.test(text));
    if (cache.size > 500) cache.clear(); // avoid unbounded growth
    cache.set(text, match);
    return match;
  };
})();

// === Queue Config ===
const INSERT_BATCH_SIZE = 100;
const INSERT_INTERVAL_MS = 5000;
const MAX_QUEUE_LENGTH = 1000;
const MAX_RETRIES = 3;
let insertQueue = [];
let isInserting = false;

// === Flush Queue (Safe) ===
const flushQueue = async () => {
  if (isInserting || insertQueue.length === 0) return;
  isInserting = true;

  const batch = insertQueue.splice(0, INSERT_BATCH_SIZE);
  try {
    const { error } = await supabase.from("posts_unlabeled").insert(batch);
    if (error) {
      console.warn("❌ Supabase insert error:", error.message);
      const retryable = batch
        .map((item) => ({ ...item, _retries: (item._retries || 0) + 1 }))
        .filter((item) => item._retries <= MAX_RETRIES);
      insertQueue.unshift(...retryable);
    }
  } catch (err) {
    console.error("🔥 Insert exception:", err.stack || err);
    const retryable = batch
      .map((item) => ({ ...item, _retries: (item._retries || 0) + 1 }))
      .filter((item) => item._retries <= MAX_RETRIES);
    insertQueue.unshift(...retryable);
  } finally {
    isInserting = false;
    if (insertQueue.length > MAX_QUEUE_LENGTH) {
      insertQueue = insertQueue.slice(-MAX_QUEUE_LENGTH); // keep latest
    }
  }
};

setInterval(flushQueue, INSERT_INTERVAL_MS);

// === Graceful Shutdown ===
process.on("SIGINT", async () => {
  console.log("🛑 SIGINT — flushing queue...");
  await flushQueue();
  process.exit(0);
});

// === Firehose Stream ===
const idResolver = new IdResolver();
let firehoseStarted = false;

const firehose = new Firehose({
  service: "wss://bsky.network",
  idResolver,
  filterCollections: ["app.bsky.feed.post"],

  handleEvent: async (evt) => {
    try {
      if (evt.event !== "create") return;
      const post = evt.record;
      if (!post?.text || post.reply || post?.$type !== "app.bsky.feed.post")
        return;
      if (!isMentalHealthPost(post.text)) return;
      if (!evt.did) return;

      insertQueue.push({
        uri: evt.uri.toString(),
        did: evt.did,
        text: post.text,
        created_at: post.createdAt || evt.time,
        langs: post.langs || [],
        facets: post.facets || null,
        reply: null,
        embed: post.embed || null,
        ingestion_time: new Date().toISOString(),
      });

      // Early flush trigger if backlog is large
      if (insertQueue.length >= INSERT_BATCH_SIZE * 2 && !isInserting) {
        await flushQueue();
      }
    } catch (err) {
      console.error("🔥 Event handler error:", err.stack || err);
    }
  },

  onError: (err) => {
    console.error("🔥 Firehose error:", err.stack || err);
  },
});

// === Memory Monitor (Only if high usage) ===
setInterval(() => {
  const { rss } = process.memoryUsage();
  const mb = rss / 1024 / 1024;
  if (mb > 120) {
    console.warn(`[MEMORY WARNING] RSS: ${mb.toFixed(1)}MB`);
  }
}, 60000);

// === Start Once ===
if (!firehoseStarted) {
  firehoseStarted = true;
  firehose.start();
  console.log("🚀 Firehose started.");
}
