#!/usr/bin/env python3
"""Download officer headshots emailed with subject "POC Photo <Name>".

Officers email a photo each year; the webmaster forwards them to a personal
inbox with a normalized subject line. This pulls the attachments down into
public/leadership/ named after the person, so the pleadership page and the
officer_data.ImagePath column can agree on a filename.

Reads GMAIL_USER and GMAIL_APP_PASSWORD from the repo .env (an app password
from https://myaccount.google.com/apppasswords, not the account password).

Usage:
    python3 scripts/fetch_poc_photos.py [--dry-run]
"""

import email
import email.header
import email.utils
import imaplib
import os
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "public" / "leadership"
SUBJECT_PREFIX = "POC Photo "

# Signature logos and tracking pixels ride along on Outlook forwards. No real
# headshot is this small, so size is a more reliable filter than the
# Content-Disposition header, which Apple Mail sets to "inline" on genuine
# photo attachments too.
MIN_IMAGE_BYTES = 20_000

# The email subject and the name on the officer's member row disagree here.
# Keyed on the lowercased subject remainder.
SLUG_OVERRIDES = {
    "alex padberg": "alexandra_padberg",
}


def slugify(name):
    """"Justin O'Connor" -> "justin_oconnor". Apostrophes vanish rather than
    becoming separators, to match the existing files in public/leadership/."""
    key = name.strip().lower()
    if key in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[key]
    stripped = key.replace("'", "").replace("’", "")

    return re.sub(r"[^a-z]+", "_", stripped).strip("_")


def _self_check():
    assert slugify("Justin O'Connor") == "justin_oconnor"
    assert slugify("Justin O’Connor") == "justin_oconnor"
    assert slugify("Alex Padberg") == "alexandra_padberg"
    assert slugify("Gabi LaBelle") == "gabi_labelle"
    assert slugify("David Huang Xu") == "david_huang_xu"
    assert slugify("  Ella Shen  ") == "ella_shen"


def load_env():
    env_path = REPO / ".env"
    if not env_path.exists():
        sys.exit(f"missing {env_path}")
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))

    missing = [k for k in ("GMAIL_USER", "GMAIL_APP_PASSWORD") if not os.environ.get(k)]
    if missing:
        sys.exit(f"missing in .env: {', '.join(missing)}")


def decode_header(raw):
    if not raw:
        return ""

    return str(email.header.make_header(email.header.decode_header(raw)))


def extension_for(filename):
    ext = os.path.splitext(filename)[1].lower()

    return ".jpg" if ext == ".jpeg" else ext


def image_parts(msg):
    """Every part that looks like a real photo rather than signature furniture."""
    found = []
    for part in msg.walk():
        if part.get_content_maintype() != "image":
            continue
        filename = part.get_filename()
        if not filename:
            continue
        payload = part.get_payload(decode=True)
        if not payload or len(payload) < MIN_IMAGE_BYTES:
            continue
        found.append((decode_header(filename), payload))

    return found


def collect(conn):
    """Map slug -> list of candidate (date, display_name, filename, payload)."""
    status, data = conn.search(None, "SUBJECT", f'"{SUBJECT_PREFIX.strip()}"')
    if status != "OK":
        sys.exit(f"IMAP search failed: {status}")
    uids = data[0].split()
    print(f"{len(uids)} messages matching subject {SUBJECT_PREFIX.strip()!r}\n")

    candidates = {}
    for index, uid in enumerate(uids, 1):
        status, payload = conn.fetch(uid, "(RFC822)")
        if status != "OK":
            print(f"  [{index}/{len(uids)}] fetch failed for uid {uid!r}, skipping")
            continue
        msg = email.message_from_bytes(payload[0][1])
        subject = decode_header(msg["Subject"])
        if not subject.startswith(SUBJECT_PREFIX):
            continue
        display_name = subject[len(SUBJECT_PREFIX) :].strip()
        slug = slugify(display_name)

        try:
            sent = email.utils.parsedate_to_datetime(msg["Date"])
        except (TypeError, ValueError):
            sent = None

        images = image_parts(msg)
        print(f"  [{index}/{len(uids)}] {display_name} -> {len(images)} image part(s)")
        if not images:
            candidates.setdefault(slug, [])
            continue

        if len(images) > 1:
            names = ", ".join(f"{n} ({len(p)}b)" for n, p in images)
            print(f"      WARNING: multiple images, taking the largest: {names}")
        filename, data_bytes = max(images, key=lambda pair: len(pair[1]))
        candidates.setdefault(slug, []).append((sent, display_name, filename, data_bytes))

    return candidates


def main():
    _self_check()
    dry_run = "--dry-run" in sys.argv

    load_env()
    conn = imaplib.IMAP4_SSL("imap.gmail.com")
    conn.login(os.environ["GMAIL_USER"], os.environ["GMAIL_APP_PASSWORD"])
    try:
        conn.select("INBOX", readonly=True)
        candidates = collect(conn)
    finally:
        conn.logout()

    print()
    written = 0
    missing = []
    for slug in sorted(candidates):
        entries = candidates[slug]
        if not entries:
            print(f"{slug}: NO ATTACHMENT")
            missing.append(slug)
            continue

        note = ""
        if len(entries) > 1:
            # Duplicate forwards happen when a first attempt arrives empty.
            entries.sort(key=lambda e: (e[0] is not None, e[0]))
            note = f"  (PICKED newest of {len(entries)})"
        _, display_name, filename, data_bytes = entries[-1]

        ext = extension_for(filename)
        target = OUT_DIR / f"{slug}{ext}"
        print(f"{slug}: {target.name}  {len(data_bytes):,}b  <- {filename}{note}")
        if not dry_run:
            target.write_bytes(data_bytes)
            written += 1

    print()
    if dry_run:
        print(f"dry run, nothing written. {len(candidates) - len(missing)} would be saved.")
    else:
        print(f"wrote {written} file(s) to {OUT_DIR}")
    if missing:
        print(f"no attachment found for: {', '.join(missing)}")


if __name__ == "__main__":
    main()
