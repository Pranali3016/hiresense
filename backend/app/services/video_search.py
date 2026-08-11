from googleapiclient.discovery import build
from app.core.config import settings


def search_video_for_topic(topic: str) -> str | None:
    """Search YouTube for a real, relevant tutorial video for this topic.
    Returns the video URL, or None if search fails or finds nothing."""
    if not settings.youtube_api_key:
        return None

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
        print(f"Video search failed for '{topic}': {e}")
        return None
