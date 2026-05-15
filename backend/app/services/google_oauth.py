from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.config import settings


class GoogleTokenInfo:
    def __init__(self, sub: str, email: str, name: str | None) -> None:
        self.sub = sub
        self.email = email
        self.name = name


def verify_google_id_token(token: str) -> GoogleTokenInfo | None:
    if not settings.google_client_id:
        return None
    try:
        info = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.google_client_id
        )
    except ValueError:
        return None

    sub = info.get("sub")
    email = info.get("email")
    if not sub or not email:
        return None

    return GoogleTokenInfo(sub=sub, email=email, name=info.get("name"))
