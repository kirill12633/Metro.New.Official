#!/usr/bin/env python3
"""Fetch recent article metadata from the public GDELT DOC API.

The feed contains headlines, source domains, timestamps and original article URLs.
It does not copy article bodies or invent summaries.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "news" / "news-feed.json"
API = "https://api.gdeltproject.org/api/v2/doc/doc"
USER_AGENT = "MetroNewNewsFeed/1.0 (+https://github.com/kirill12633/Metro.New.Official)"
FEEDS = [
    ("world", "Мир", 'world OR international OR diplomacy'),
    ("politics", "Политика", 'politics OR election OR parliament OR government'),
    ("economy", "Экономика", 'economy OR business OR markets OR inflation'),
    ("technology", "Технологии", 'technology OR science OR artificial intelligence'),
    ("sports", "Спорт", 'sports OR football OR tennis OR basketball'),
    ("weather", "Погода", 'weather OR climate OR forecast'),
    ("video", "Видео", 'video report OR video interview OR video news'),
]

def parse_seen_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        dt = datetime.strptime(value, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc)
        return dt.isoformat(timespec="seconds").replace("+00:00", "Z")
    except (TypeError, ValueError):
        return None

def fetch_category(category: str, label: str, query: str) -> tuple[list[dict], bool]:
    params = {
        "query": f"({query})",
        "mode": "ArtList",
        "format": "json",
        "maxrecords": "25",
        "timespan": "24h",
        "sort": "DateDesc",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read(2_000_000)
        payload = json.loads(raw.decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"WARNING: {label}: GDELT request failed: {exc}")
        return [], False

    articles = payload.get("articles", [])
    result = []
    for item in articles:
        title = str(item.get("title") or "").strip()
        url = str(item.get("url") or item.get("url_mobile") or "").strip()
        domain = str(item.get("domain") or "").strip()
        if not title or not url.startswith("https://"):
            continue
        result.append({
            "title": title[:240],
            "url": url,
            "source": domain or "Оригинальный источник",
            "published_at": parse_seen_date(item.get("seendate")),
            "category": category,
            "category_label": label,
            "language": str(item.get("language") or ""),
            "source_country": str(item.get("sourcecountry") or ""),
        })
    return result, True

def main() -> None:
    collected: list[dict] = []
    successful = 0
    for category, label, query in FEEDS:
        articles, ok = fetch_category(category, label, query)
        successful += int(ok)
        collected.extend(articles)
        time.sleep(0.7)

    if successful == 0 or not collected:
        raise SystemExit("GDELT returned no usable results; leaving the previous feed unchanged.")

    seen: set[str] = set()
    unique: list[dict] = []
    for article in sorted(collected, key=lambda a: a.get("published_at") or "", reverse=True):
        key = article["url"].split("#", 1)[0]
        if key in seen:
            continue
        seen.add(key)
        unique.append(article)
        if len(unique) >= 100:
            break

    payload = {
        "provider": "GDELT DOC API",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "articles": unique,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(unique)} real article links from {successful}/{len(FEEDS)} GDELT category queries.")

if __name__ == "__main__":
    main()
