"""Uploads every Shardwild GitHub release video that isn't on YouTube yet (max 5 per run).
Needs env: YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN, GH_TOKEN, GH_REPO; optional YT_DESCRIPTION."""
import json, os, subprocess, sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

if not all(os.environ.get(k) for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN")):
    print("YouTube secrets not set - skipping."); sys.exit(0)
gh = lambda *a: subprocess.run(["gh", *a], check=True, capture_output=True, text=True).stdout
creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"], client_id=os.environ["YT_CLIENT_ID"],
                    client_secret=os.environ["YT_CLIENT_SECRET"], token_uri="https://oauth2.googleapis.com/token")
yt = build("youtube", "v3", credentials=creds)
rels = json.loads(gh("release", "list", "--limit", "100", "--json", "tagName"))
todo = []
for r in rels:
    tag = r["tagName"]
    if not tag.startswith("v"): continue
    info = json.loads(gh("release", "view", tag, "--json", "name,body,assets,url"))
    if "youtube.com/watch" in (info["body"] or ""): continue
    mp4 = [a for a in info["assets"] if a["name"].endswith(".mp4")]
    if mp4: todo.append((float(tag[1:]), tag, info, mp4[0]["name"]))
for _, tag, info, asset in sorted(todo)[:5]:
    gh("release", "download", tag, "--pattern", asset, "--clobber", "--dir", "/tmp/yt")
    title = info["name"].replace("SHARDWILD ", "Shardwild ")[:100]
    desc = (os.environ.get("YT_DESCRIPTION", "") + "\n\n" + "A fully AI-made animated Let's Play of Shardwild, a fictional voxel survival game.\n" + info["url"]).strip()
    body = {"snippet": {"title": title, "description": desc[:4900], "categoryId": "20", "tags": ["Shardwild", "lets play", "animation", "voxel", "AI"]},
            "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False, "containsSyntheticMedia": True}}
    req = yt.videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(f"/tmp/yt/{asset}", chunksize=-1, resumable=True))
    resp = None
    while resp is None: _, resp = req.next_chunk()
    link = f"https://www.youtube.com/watch?v={resp['id']}"
    gh("release", "edit", tag, "--notes", (info["body"] or "") + f"\n\nYouTube: {link}")
    print(tag, "->", link)
