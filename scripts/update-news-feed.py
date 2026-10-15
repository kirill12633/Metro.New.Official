#!/usr/bin/env python3
"""Build a small, attributed news feed from public Google News RSS endpoints.

Only headline, short RSS description, publisher, publication date and source URL are
published. Article text and publisher images are not copied.
"""
from __future__ import annotations

import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "news" / "news-feed.json"
BASE = "https://news.google.com/rss"
REGION = {"hl": "ru", "gl": "LV", "ceid": "LV:ru"}
USER_AGENT = "MetroNewNewsBot/1.0 (+https://github.com/kirill12633/Metro.New.Official)"
CATEGORY_FEEDS = [
    ("world", "Мир", f"{BASE}/headlines/section/topic/WORLD?{urllib.parse.urlencode(REGION)}"),
    ("politics", "Политика", f"{BASE}/search?{urllib.parse.urlencode({**REGION, 'q': 'политика OR выборы OR парламент'})}"),
    ("economy", "Экономика", f"{BASE}/search?{urllib.parse.urlencode({**REGION, 'q': 'экономика OR бизнес OR финансы'})}"),
    ("technology", "Технологии", f"{BASE}/headlines/section/topic/TECHNOLOGY?{urllib.parse.urlencode(REGION)}"),
    ("sports", "Спорт", f"{BASE}/headlines/section/topic/SPORTS?{urllib.parse.urlencode(REGION)}"),
    ("weather", "Погода", f"{BASE}/search?{urllib.parse.urlencode({**REGION, 'q': 'погода OR климат'})}"),
    ("video", "Видео", f"{BASE}/search?{urllib.parse.urlencode({**REGION, 'q': 'видеорепортаж OR видео новости'})}"),
]

def plain_text(value: str | None, limit: int = 300) -> str:
    if not value:
        return ""
    value = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", value)
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:limit].rstrip()

def published_at(value: str | None) -> str | None:
    if not value:
        return None
    try:
        dt = parsedate_to_datetime(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    except (TypeError, ValueError, OverflowError):
        return None

def fetch_feed(url: str, category: str, label: str) -> tuple[list[dict], bool]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read(3_000_000)
        root = ET.fromstring(raw)
    except (urllib.error.URLError, TimeoutError, ET.ParseError, OSError) as exc:
        print(f"WARNING: {label} RSS unavailable: {exc}")
        return [], False

    items = root.findall(".//item")
    if not items:
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")
    found = []
    for item in items[:30]:
        title = plain_text(item.findtext("title"), 220)
        link = (item.findtext("link") or "").strip()
        if not link:
            link_node = item.find("{http://www.w3.org/2005/Atom}link")
            link = link_node.attrib.get("href", "").strip() if link_node is not None else ""
        if not title or not link.startswith("https://"):
            continue
        source_node = item.find("source")
        source = plain_text(source_node.text if source_node is not None else "", 100)
        if not source:
            source = label
        description = plain_text(item.findtext("description"), 300)
        date_value = item.findtext("pubDate") or item.findtext("{http://www.w3.org/2005/Atom}updated") or item.findtext("{http://www.w3.org/2005/Atom}published")
        found.append({
            "title": title,
            "description": description,
            "url": link,
            "source": source,
            "published_at": published_at(date_value),
            "category": category,
            "category_label": label,
        })
    return found, True

def main() -> None:
    collected: list[dict] = []
    successful_feeds = 0
    for category, label, url in CATEGORY_FEEDS:
        articles, ok = fetch_feed(url, category, label)
        successful_feeds += int(ok)
        collected.extend(articles)
        time.sleep(0.4)

    if successful_feeds == 0 or not collected:
        raise SystemExit("No usable RSS feed was retrieved; preserving the existing JSON feed.")

    seen = set()
    unique = []
    for article in sorted(collected, key=lambda item: item.get("published_at") or "", reverse=True):
        key = article["url"]
        if key in seen:
            continue
        seen.add(key)
        unique.append(article)
        if len(unique) >= 70:
            break

    payload = {
        "provider": "Google News RSS",
        "region": "Latvia",
        "language": "ru",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "articles": unique,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(unique)} attributed headlines from {successful_feeds}/{len(CATEGORY_FEEDS)} RSS feeds to {OUTPUT}")

if __name__ == "__main__":
    main()
