"""Inspect trace contents using only Python's standard library."""

import collections
import json
from pathlib import Path
import sys
import zipfile

if len(sys.argv) < 2:
    raise SystemExit("Usage: python3 scripts/inspect-trace.py <trace.zip or results directory> [...]")

for argument in sys.argv[1:]:
    source = Path(argument)
    traces = [source] if source.is_file() else sorted(source.rglob("trace.zip"))
    if not traces:
        raise SystemExit(f"No trace.zip found in {source}")
    for trace in traces:
        events = []
        with zipfile.ZipFile(trace) as archive:
            for name in archive.namelist():
                if name.endswith(".trace"):
                    events.extend(
                        json.loads(line)
                        for line in archive.read(name).decode().splitlines()
                        if line
                    )
        counts = collections.Counter(event.get("type") for event in events)
        clicks = [
            event for event in events
            if event.get("type") == "before" and event.get("method") == "click"
        ]
        click_ids = {event["callId"] for event in clicks}
        click_snapshots = [
            event for event in events
            if event.get("type") == "frame-snapshot"
            and event["snapshot"].get("callId") in click_ids
        ]
        print(json.dumps({
            "trace": str(trace),
            "browser_clicks": len(clicks),
            "click_dom_snapshots": len(click_snapshots),
            "total_dom_snapshots": counts["frame-snapshot"],
            "screencast_frames": counts["screencast-frame"],
        }, indent=2))
