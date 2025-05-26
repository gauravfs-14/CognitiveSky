# 📡 Bluesky Mental Health Firehose Worker

This is a real-time Node.js worker that listens to the [Bluesky Firehose](https://atproto.com) for **top-level public posts** related to mental health. It filters posts using keyword-based NLP heuristics and stores relevant data into a **Supabase PostgreSQL database** for downstream sentiment/emotion analysis, topic modeling, and dashboard summarization.

---

## 🧠 Features

* ✅ Connects to Bluesky's real-time Firehose using `@atproto/sync`
* ✅ Filters only **top-level** `app.bsky.feed.post` events
* ✅ Detects posts related to **mental health** using a curated keyword list + regex
* ✅ Inserts matching posts into a Supabase `posts_unlabeled` table
* ✅ Uses efficient **batched inserts** to minimize API usage
* ✅ Auto-reconnects and flushes queue on shutdown
* ✅ Designed for 24/7 deployment on Render, Fly.io, or VPS

---

### 📁 Folder Structure

```bash
mh_worker/
├── index.js                # Firehose connection + filtering + batching
├── utils/
│   └── db.js               # Supabase client setup
├── .env                    # (Not committed) Holds API keys
├── package.json
├── README.md
```

---

### ⚙️ Environment Variables

Create a `.env` file (or define in Render's Environment tab):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

> Use the `service_role` key from Supabase API settings. This allows full insert access to bypass RLS.

---

### 🏁 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/your-org/mh_worker.git
cd mh_worker

# Install dependencies
npm install

# Create a .env file with your Supabase credentials

# Run the worker
node index.js
```

### 🗃 Supabase Table Schema

```sql
create table if not exists posts_unlabeled (
  uri text primary key,
  did text not null,
  text text not null,
  created_at timestamp,
  langs text[],
  facets jsonb,
  reply jsonb,
  embed jsonb,
  ingestion_time timestamp default now()
);
```
