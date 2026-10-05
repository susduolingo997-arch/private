"""Run ONCE on your own computer to get YT_REFRESH_TOKEN.
   pip install google-auth-oauthlib
   python youtube_auth.py client_secret.json      (the JSON you downloaded for your OAuth 'Desktop app' client)"""
import sys
from google_auth_oauthlib.flow import InstalledAppFlow
flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], ["https://www.googleapis.com/auth/youtube.upload"])
c = flow.run_local_server(port=0, prompt="consent", access_type="offline")
print("\nYT_CLIENT_ID     =", c.client_id, "\nYT_CLIENT_SECRET =", c.client_secret, "\nYT_REFRESH_TOKEN =", c.refresh_token)
