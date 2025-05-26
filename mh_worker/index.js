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

function isMentalHealthPost(text = "") {
  return mentalHealthRegexes.some((regex) => regex.test(text));
}

// Batch insert setup
const INSERT_BATCH_SIZE = 100;
const INSERT_INTERVAL_MS = 5000;
let insertQueue = [];
let isInserting = false;

const flushQueue = async () => {
  if (insertQueue.length === 0 || isInserting) return;

  isInserting = true;
  const batch = insertQueue.splice(0, INSERT_BATCH_SIZE);

  try {
    const { error } = await supabase.from("posts_unlabeled").insert(batch);
    if (error) {
      console.error("❌ Supabase batch insert error:", error.message);
      // Optionally requeue
      insertQueue.unshift(...batch);
    } else {
      console.log(`✅ Inserted batch of ${batch.length}`);
    }
  } catch (err) {
    console.error("🔥 Unexpected batch insert error:", err.stack || err);
    insertQueue.unshift(...batch);
  }

  isInserting = false;
};

setInterval(flushQueue, INSERT_INTERVAL_MS);

// Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down — flushing remaining posts...");
  await flushQueue();
  process.exit(0);
});

// Firehose stream setup
const idResolver = new IdResolver();

const firehose = new Firehose({
  service: "wss://bsky.network",
  idResolver,
  filterCollections: ["app.bsky.feed.post"],

  handleEvent: async (evt) => {
    try {
      if (evt.event !== "create") return;
      const post = evt.record;

      if (!post?.text || post.reply) return; // only top-level posts
      if (post?.$type !== "app.bsky.feed.post") return;
      if (!isMentalHealthPost(post.text)) return;
      if (!evt.did) {
        console.warn("⚠️ Missing DID:", evt.uri.toString());
        return;
      }

      const record = {
        uri: evt.uri.toString(),
        did: evt.did,
        text: post.text,
        created_at: post.createdAt || evt.time,
        langs: post.langs || [],
        facets: post.facets || null,
        reply: null,
        embed: post.embed || null,
        ingestion_time: new Date().toISOString(),
      };

      insertQueue.push(record);

      if (insertQueue.length >= INSERT_BATCH_SIZE) {
        console.log("⚠️ Queue full — flushing early...");
        await flushQueue();
      }
    } catch (err) {
      console.error("🔥 Event handler error:", err.stack || err);
    }
  },

  onError: (err) => {
    console.error("🔥 Firehose stream error:", err.stack || err);
  },
});

firehose.start();
