import os
import json
import hashlib
import datetime
import re
from collections import Counter
from dotenv import load_dotenv
import httpx
import libsql_experimental as libsql
from dateutil.parser import isoparse

# === Load ENV ===
load_dotenv()
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")
BLUESKY_USERNAME = os.getenv("BLUESKY_USERNAME")
BLUESKY_PASSWORD = os.getenv("BLUESKY_PASSWORD")

# === Constants ===
today = datetime.date.today().isoformat()
BATCH_SIZE = 100
POST_META_BATCH_SIZE = 25

# === Connect to DB ===
conn = libsql.connect("/tmp/replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
conn.sync()
conn.execute("""
CREATE TABLE IF NOT EXISTS summary_snapshots (
    date TEXT,
    type TEXT,
    scope TEXT,
    hash TEXT,
    data TEXT,
    PRIMARY KEY(date, type, scope)
)
""")
conn.execute("""
CREATE TABLE IF NOT EXISTS post_meta (
    uri TEXT PRIMARY KEY,
    likes INTEGER,
    reposts INTEGER,
    replies INTEGER,
    author_did TEXT,
    author_handle TEXT
)
""")
conn.execute("""
CREATE TABLE IF NOT EXISTS user_meta (
    did TEXT PRIMARY KEY,
    followers INTEGER,
    posts INTEGER,
    handle TEXT
)
""")

# === Helpers ===
def compute_hash(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()

def store_snapshot(type_, scope, data):
    hash_val = compute_hash(data)
    row = conn.execute(
        "SELECT hash FROM summary_snapshots WHERE date=? AND type=? AND scope=?",
        (today, type_, scope)
    ).fetchone()

    if row and row[0] == hash_val:
        print(f"✅ Skipping unchanged {type_}:{scope}")
        return

    conn.execute("""
        INSERT OR REPLACE INTO summary_snapshots (date, type, scope, hash, data)
        VALUES (?, ?, ?, ?, ?)
    """, (today, type_, scope, hash_val, json.dumps(data)))
    print(f"📦 Stored snapshot {type_}:{scope} ({len(data) if isinstance(data, dict) else 'list'})")

def extract_hashtags(text):
    return re.findall(r"#\w+", text)

def extract_emojis(text):
    emoji_pattern = re.compile(r"["
        r"\U0001F600-\U0001F64F"
        r"\U0001F300-\U0001F5FF"
        r"\U0001F680-\U0001F6FF"
        r"\U0001F1E0-\U0001F1FF"
        r"\U00002700-\U000027BF"
        r"\U0001F900-\U0001F9FF"
        r"\U00002600-\U000026FF"
        r"]+", flags=re.UNICODE)
    return emoji_pattern.findall(text)

# === Bluesky Auth & Batch Post Fetch ===
def create_bluesky_session():
    res = httpx.post("https://bsky.social/xrpc/com.atproto.server.createSession", json={
        "identifier": BLUESKY_USERNAME,
        "password": BLUESKY_PASSWORD
    })
    res.raise_for_status()
    return res.json()["accessJwt"]

bsky_token = create_bluesky_session()
bsky_headers = {"Authorization": f"Bearer {bsky_token}"}

def fetch_post_batch(batch):
    try:
        params = [("uris", uri) for uri in batch]
        res = httpx.get(
            "https://bsky.social/xrpc/app.bsky.feed.getPosts",
            headers=bsky_headers,
            params=params,
            timeout=10
        )
        res.raise_for_status()
        posts = res.json().get("posts", [])
        return {post["uri"]: post for post in posts}
    except Exception as e:
        print(f"⚠️ Batch fetch failed: {e}")
        return {}

def get_user_meta_batch(dids):
    if not dids:
        return {}

    # Filter out ones that are already cached in the DB
    placeholders = ",".join("?" for _ in dids)
    existing = conn.execute(
        f"SELECT * FROM user_meta WHERE did IN ({placeholders})", tuple(dids)
    ).fetchall()

    cache = {
        row[0]: dict(zip(["did", "followers", "posts", "handle"], row))
        for row in existing
    }

    to_fetch = [did for did in dids if did not in cache]

    # Now fetch from Bluesky API in batches
    for i in range(0, len(to_fetch), 25):
        batch = to_fetch[i:i + 25]
        try:
            res = httpx.get(
                "https://bsky.social/xrpc/app.bsky.actor.getProfiles",
                headers=bsky_headers,
                params=[("actors", did) for did in batch],
                timeout=10
            )
            res.raise_for_status()
            profiles = res.json().get("profiles", [])
            for profile in profiles:
                did = profile.get("did")
                meta = {
                    "did": did,
                    "followers": profile.get("followersCount", 0),
                    "posts": profile.get("postsCount", 0),
                    "handle": profile.get("handle", "")
                }
                conn.execute("INSERT OR REPLACE INTO user_meta VALUES (?, ?, ?, ?)", tuple(meta.values()))
                cache[did] = meta
        except Exception as e:
            print(f"⚠️ Failed batch user meta fetch: {e}")

    return cache

# === Aggregate Summary ===
hashtags = Counter()
emojis = Counter()
posts_by_day = Counter()
top_posts = []
top_users = {}
columns = [col[1] for col in conn.execute("PRAGMA table_info(posts)").fetchall()]
offset = 0
all_uris = []

while True:
    rows = conn.execute("SELECT * FROM posts LIMIT ? OFFSET ?", (BATCH_SIZE, offset)).fetchall()
    if not rows:
        break
    for tup in rows:
        row = dict(zip(columns, tup))
        uri = row["uri"]
        created = isoparse(row["created_at"]).date()
        posts_by_day[str(created)] += 1
        all_uris.append(uri)
        hashtags.update(extract_hashtags(row["text"]))
        emojis.update(extract_emojis(row["text"]))
    offset += BATCH_SIZE

def is_valid_bsky_uri(uri):
    return isinstance(uri, str) and uri.startswith("at://") and "/app.bsky.feed.post/" in uri

# === Batch Enrichment ===
meta_cache = {}
for i in range(0, len(all_uris), POST_META_BATCH_SIZE):
    batch = [u for u in all_uris[i:i+POST_META_BATCH_SIZE] if is_valid_bsky_uri(u)]
    if not batch:
        continue
    print("📤 Fetching posts batch:", i)
    enriched = fetch_post_batch(batch)
    meta_cache.update(enriched)

    for post in enriched.values():
        conn.execute("""
            INSERT OR REPLACE INTO post_meta (uri, likes, reposts, replies, author_did, author_handle)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            post.get("uri"),
            post.get("likeCount", 0),
            post.get("repostCount", 0),
            post.get("replyCount", 0),
            post.get("author", {}).get("did"),
            post.get("author", {}).get("handle")
        ))



all_rows = conn.execute("SELECT * FROM posts").fetchall()
all_dids = list({
    meta_cache.get(dict(zip(columns, row))["uri"], {}).get("author_did", dict(zip(columns, row))["did"])
    for row in all_rows
})

user_meta_cache = get_user_meta_batch(all_dids)

for row in conn.execute("SELECT * FROM posts").fetchall():
    row = dict(zip(columns, row))
    meta = meta_cache.get(row["uri"], {})
    did = meta.get("author_did", row["did"])
    profile = user_meta_cache.get(did, {})
    score = meta.get("likes", 0) + meta.get("reposts", 0) + meta.get("replies", 0)
    top_posts.append({
        "uri": row["uri"],
        "text": row["text"],
        "did": did,
        "likes": meta.get("likes", 0),
        "reposts": meta.get("reposts", 0),
        "replies": meta.get("replies", 0),
        "score": score,
        "created_at": row["created_at"]
    })

    if did not in top_users:
        top_users[did] = {
            "posts": 0, "likes": 0, "reposts": 0,
            "followers": profile.get("followers", 0),
            "handle": profile.get("handle", "")
        }

    top_users[did]["posts"] += 1
    top_users[did]["likes"] += meta.get("likes", 0)
    top_users[did]["reposts"] += meta.get("reposts", 0)



# === SQL Summaries ===
def sql_summary(query):
    return {r[0]: r[1] for r in conn.execute(query).fetchall()}

store_snapshot("narratives", "overall", sql_summary("SELECT sentiment, COUNT(*) FROM posts GROUP BY sentiment"))
store_snapshot("emotions", "overall", sql_summary("SELECT emotion, COUNT(*) FROM posts GROUP BY emotion"))

langs_rows = conn.execute("SELECT langs FROM posts").fetchall()
lang_counts = Counter()
for (raw,) in langs_rows:
    if raw:
        try:
            for l in json.loads(raw):
                lang_counts[l] += 1
        except Exception:
            continue

store_snapshot("languages", "overall", dict(lang_counts))
store_snapshot("hashtags", "overall", dict(hashtags.most_common(100)))
store_snapshot("emojis", "overall", dict(emojis.most_common(100)))
store_snapshot("volume", "timeline", dict(posts_by_day))
store_snapshot("posts", "top_by_interaction", sorted(top_posts, key=lambda p: p["score"], reverse=True)[:50])
store_snapshot("users", "top_by_posts", sorted(
    [{"did": k, **v} for k, v in top_users.items()],
    key=lambda x: x["posts"], reverse=True)[:20])
store_snapshot("users", "top_by_followers", sorted(
    [{"did": k, **v} for k, v in top_users.items()],
    key=lambda x: x["followers"], reverse=True)[:20])
store_snapshot("users", "top_by_interactions", sorted(
    [{"did": k, **v} for k, v in top_users.items()],
    key=lambda x: x["likes"] + x["reposts"], reverse=True)[:20])

conn.commit()
conn.sync()

# === Export JSON ===
os.makedirs("summary", exist_ok=True)
def export_group_all_dates(types, filename):
    data = {}
    for t in types:
        rows = conn.execute(
            "SELECT date, scope, data FROM summary_snapshots WHERE type=?",
            (t,)
        ).fetchall()
        for date, scope, d in rows:
            data.setdefault(date, {}).setdefault(t, {})[scope] = json.loads(d)
    with open(f"summary/{filename}", "w") as f:
        json.dump(data, f, indent=2)
    print(f"📤 summary/{filename} written.")


export_group_all_dates(["narratives", "emotions", "languages"], "narratives.json")
export_group_all_dates(["hashtags", "emojis"], "hashtags.json")
export_group_all_dates(["volume"], "activity.json")
export_group_all_dates(["users", "posts"], "engagement.json")

print("✅ Snapshot complete with batching, caching, and batch enrichment.")