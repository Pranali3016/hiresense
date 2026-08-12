import socket
import logging
from googleapiclient.discovery import build
from app.core.config import settings

logger = logging.getLogger(__name__)


def search_video_for_topic(topic: str) -> str | None:
    """
    Search YouTube for a real, relevant tutorial video for this topic.
    Bounded with a 5-second socket timeout and guaranteed safe fallback (returns None or fallback query).
    """
    if not settings.youtube_api_key or settings.youtube_api_key.startswith("your_"):
        return None

    # Guard socket timeout to prevent indefinite hanging
    prev_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(5.0)

    try:
        youtube = build("youtube", "v3", developerKey=settings.youtube_api_key)
        request = youtube.search().list(
            part="snippet",
            q=f"{topic} tutorial",
            type="video",
            maxResults=1,
            relevanceLanguage="en",
            videoDuration="medium",
        )
        response = request.execute()
        items = response.get("items", [])
        if not items:
            return None
        video_id = items[0]["id"]["videoId"]
        return f"https://www.youtube.com/watch?v={video_id}"
    except Exception as e:
        logger.warning(f"Video search failed for topic '{topic}': {e}")
        return None
    finally:
        socket.setdefaulttimeout(prev_timeout)
