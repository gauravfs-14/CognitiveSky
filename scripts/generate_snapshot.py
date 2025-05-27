import os
import json
import hashlib
import datetime
import re
import time
from collections import Counter
from dotenv import load_dotenv
import httpx
import libsql_experimental as libsql
from dateutil.parser import isoparse

# === Load ENV ===
load_dotenv()
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_DB_TOKEN")
BLUESKY_USERNAME = os.getenv("BLUESKY_USERNAME")
BLUESKY_PASSWORD = os.getenv("BLUESKY_PASSWORD")

# === Constants ===
today = datetime.date.today().isoformat()
today_date = datetime.date.today()
seven_days_ago = today_date - datetime.timedelta(days=7)
BATCH_SIZE = 100

# === Connect to DB ===
conn = libsql.connect("/tmp/replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_AUTH_TOKEN)
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

    if row and row["hash"] == hash_val:
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

# === Bluesky API Auth ===
def create_bluesky_session():
    res = httpx.post("https://bsky.social/xrpc/com.atproto.server.createSession", json={
        "identifier": BLUESKY_USERNAME,
        "password": BLUESKY_PASSWORD
    })
    res.raise_for_status()
    return res.json()["accessJwt"]

bsky_token = create_bluesky_session()
bsky_headers = {"Authorization": f"Bearer {bsky_token}"}

def get_post_meta(uri):
    row = conn.execute("SELECT * FROM post_meta WHERE uri = ?", (uri,)).fetchone()
    if row:
        return dict(zip(["uri", "likes", "reposts", "replies", "author_did", "author_handle"], row))
    try:
        res = httpx.get(f"https://bsky.social/xrpc/app.bsky.feed.getPostThread?uri={uri}&depth=0", headers=bsky_headers, timeout=10)
        res.raise_for_status()
        post = res.json().get("thread", {}).get("post", {})
        meta = {
            "uri": uri,
            "likes": post.get("likeCount", 0),
            "reposts": post.get("repostCount", 0),
            "replies": post.get("replyCount", 0),
            "author_did": post.get("author", {}).get("did", ""),
            "author_handle": post.get("author", {}).get("handle", ""),
        }
        conn.execute("INSERT OR REPLACE INTO post_meta VALUES (?, ?, ?, ?, ?, ?)", tuple(meta.values()))
        return meta
    except Exception as e:
        print(f"⚠️ Failed to fetch post meta for {uri}: {e}")
        return None

def get_user_meta(did):
    row = conn.execute("SELECT * FROM user_meta WHERE did = ?", (did,)).fetchone()
    if row:
        return dict(zip(["did", "followers", "posts", "handle"], row))
    try:
        res = httpx.get(f"https://bsky.social/xrpc/app.bsky.actor.getProfile?actor={did}", headers=bsky_headers, timeout=10)
        res.raise_for_status()
        profile = res.json()
        meta = {
            "did": did,
            "followers": profile.get("followersCount", 0),
            "posts": profile.get("postsCount", 0),
            "handle": profile.get("handle", ""),
        }
        conn.execute("INSERT OR REPLACE INTO user_meta VALUES (?, ?, ?, ?)", tuple(meta.values()))
        return meta
    except Exception as e:
        print(f"⚠️ Failed to fetch user meta for {did}: {e}")
        return None

# === Summary Metrics ===
hashtags = Counter()
emojis = Counter()
posts_by_day = Counter()
top_posts = []
top_users = {}

offset = 0
while True:
    rows = conn.execute("SELECT * FROM posts LIMIT ? OFFSET ?", (BATCH_SIZE, offset)).fetchall()
    if not rows:
        break
    columns = [col[1] for col in conn.execute("PRAGMA table_info(posts)").fetchall()]
    for tup in rows:
        row = dict(zip(columns, tup))
        created = isoparse(row["created_at"]).date()
        posts_by_day[str(created)] += 1

        for tag in extract_hashtags(row["text"]):
            hashtags[tag] += 1
        for emj in extract_emojis(row["text"]):
            emojis[emj] += 1

        meta = get_post_meta(row["uri"]) or {}
        profile = get_user_meta(meta.get("author_did", row["did"])) or {}

        score = meta.get("likes", 0) + meta.get("reposts", 0) + meta.get("replies", 0)
        top_posts.append({
            "uri": row["uri"],
            "text": row["text"],
            "did": meta.get("author_did", row["did"]),
            "likes": meta.get("likes", 0),
            "reposts": meta.get("reposts", 0),
            "replies": meta.get("replies", 0),
            "score": score,
            "created_at": row["created_at"]
        })

        did = meta.get("author_did", row["did"])
        if did not in top_users:
            top_users[did] = {
                "posts": 0, "likes": 0, "reposts": 0,
                "followers": profile.get("followers", 0),
                "handle": profile.get("handle", "")
            }
        top_users[did]["posts"] += 1
        top_users[did]["likes"] += meta.get("likes", 0)
        top_users[did]["reposts"] += meta.get("reposts", 0)

        time.sleep(0.5)  # throttle to avoid hitting Bluesky rate limits
    offset += BATCH_SIZE

# === SQL-based summaries ===
def sql_summary(query, key="label", val="count"):
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

# === JSON EXPORT ===
os.makedirs("summary", exist_ok=True)
def export_group(types, filename):
    data = {}
    for t in types:
        rows = conn.execute(
            "SELECT scope, data FROM summary_snapshots WHERE date=? AND type=?",
            (today, t)
        ).fetchall()
        data[t] = {r[0]: json.loads(r[1]) for r in rows}
    with open(f"summary/{filename}", "w") as f:
        json.dump(data, f, indent=2)
    print(f"📤 summary/{filename} written.")

export_group(["narratives", "emotions", "languages"], "narratives.json")
export_group(["hashtags", "emojis"], "hashtags.json")
export_group(["volume"], "activity.json")
export_group(["users", "posts"], "engagement.json")

print("✅ Snapshot complete with batching, caching, and SQL summaries.")
