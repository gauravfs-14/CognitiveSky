import sqlite3
import pandas as pd
import json

def extract_clean_posts(db_path: str, output_path: str):
    # Connect to SQLite DB
    conn = sqlite3.connect(db_path)
    print("📦 Connected to database:", db_path)

    # Load necessary columns
    df = pd.read_sql_query("SELECT postId, authorDid, text, createdAt, fullData FROM posts;", conn)

    # Parse fullData
    def parse_row(row):
        try:
            data = json.loads(row["fullData"])

            # Language: extract from langs (take first if list exists)
            langs = data.get("langs", [])
            lang = langs[0] if isinstance(langs, list) and langs else "und"

            # Media: from embed.external
            embed = data.get("embed")
            media = []
            if isinstance(embed, dict) and embed.get("$type") == "app.bsky.embed.external":
                external = embed.get("external", {})
                media = [{
                    "title": external.get("title"),
                    "uri": external.get("uri"),
                    "description": external.get("description")
                }]

            # Replies
            reply = data.get("reply", {})
            parent_uri = reply.get("parent", {}).get("uri")
            root_uri = reply.get("root", {}).get("uri")

            return {
                "postId": row["postId"],
                "authorDid": row["authorDid"],
                "text": row["text"],
                "createdAt": row["createdAt"],
                "lang": lang,
                "media": media,
                "replyParentUri": parent_uri,
                "replyRootUri": root_uri,
                "hasMedia": bool(media)
            }

        except Exception as e:
            print("⚠️ Skipping malformed row:", e)
            return None

    # Apply parser
    print("🔄 Parsing records...")
    cleaned = df.apply(parse_row, axis=1).dropna().tolist()
    print(f"✅ Parsed {len(cleaned)} valid records")

    # Convert to DataFrame and export
    cleaned_df = pd.DataFrame(cleaned)
    cleaned_df.to_json(output_path, orient="records", lines=False)
    print(f"💾 Exported cleaned data to {output_path}")

# Example usage
if __name__ == "__main__":
    extract_clean_posts("./data/bluesky_posts.db", "./data/clean_posts.json")
