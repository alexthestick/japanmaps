"""
Lost in Transit — Instagram Carousel Generator
===============================================
Generates branded carousel slides matching the @lostintransit.japan aesthetic.

USAGE:
  python3 carousel_generator.py

MODES:
  1. Single Store Spotlight  — deep dive on one store (5 slides)
  2. Multi-Store Roundup     — list of stores with a theme (cover + N slides + CTA)
  3. Neighborhood Guide      — overview of an area

You can specify exact store names OR let the script suggest from the database.
"""

import os
import io
import sys
import json
import textwrap
import requests
from typing import Optional
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from supabase import create_client

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://avhtmmmblkjvinhhddzq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRtbW1ibGtqdmluaGhkZHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzQ3MjMsImV4cCI6MjA3NTAxMDcyM30.brC2CbIgMe-XW9yr6xZPRBFGRe5rZxSZ0nLzj-CFipw"

FONT_DIR = os.path.join(os.path.dirname(__file__), "../../..") + "/../../../sessions/nifty-optimistic-ritchie/fonts"
# Fallback to absolute path
FONT_DIR = "/Users/alexcoluna/lost_in_transit_fonts"

OUTPUT_DIR = os.path.expanduser("~/Desktop/carousel_output")

# Canvas size — Instagram portrait
W, H = 1080, 1350

# Brand colors
CYAN     = (0, 217, 255)        # #00D9FF
WHITE    = (255, 255, 255)
BLACK    = (0, 0, 0)
DARK     = (11, 15, 25)         # #0b0f19
GRAY     = (107, 114, 128)      # muted

# ─── FONTS ────────────────────────────────────────────────────────────────────

def load_fonts():
    def f(name, size):
        try:
            return ImageFont.truetype(os.path.join(FONT_DIR, name), size)
        except:
            return ImageFont.load_default()

    return {
        "title":      f("Inter-ExtraBold.ttf", 90),
        "title_md":   f("Inter-ExtraBold.ttf", 70),
        "title_sm":   f("Inter-ExtraBold.ttf", 54),
        "hook":       f("Inter-ExtraBold.ttf", 68),   # punchy cover hook
        "caption":    f("Inter-Bold.ttf", 60),         # larger readable captions
        "caption_sm": f("Inter-Bold.ttf", 44),
        "body":       f("Inter-Regular.ttf", 36),
        "body_sm":    f("Inter-Regular.ttf", 30),
        "label":      f("Inter-Bold.ttf", 36),
        "label_sm":   f("Inter-Medium.ttf", 28),
        "brand":      f("Inter-ExtraBold.ttf", 36),
        "brand_sm":   f("Inter-Bold.ttf", 26),
        "swipe":      f("Inter-Medium.ttf", 26),
        "counter":    f("Inter-Bold.ttf", 28),
    }

FONTS = load_fonts()

# ─── SUPABASE ─────────────────────────────────────────────────────────────────

def get_supabase():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_store_by_name(name: str):
    sb = get_supabase()
    res = sb.table("stores").select(
        "name, address, neighborhood, city, google_place_id, description, categories, hours, instagram, photos"
    ).ilike("name", f"%{name}%").limit(1).execute()
    return res.data[0] if res.data else None

def fetch_stores_by_filter(city=None, neighborhood=None, categories=None, limit=6):
    sb = get_supabase()
    q = sb.table("stores").select(
        "name, address, neighborhood, city, google_place_id, description, categories, hours, instagram, photos"
    )
    if city:
        q = q.ilike("city", f"%{city}%")
    if neighborhood:
        q = q.ilike("neighborhood", f"%{neighborhood}%")
    # Filter by category if provided
    if categories:
        q = q.contains("categories", [categories])
    res = q.limit(limit * 3).execute()  # Fetch more, filter down
    stores = [s for s in res.data if s.get("photos")]  # Only stores with photos
    return stores[:limit]

# ─── IMAGE HELPERS ────────────────────────────────────────────────────────────

def download_image(url: str) -> Optional[Image.Image]:
    if not url:
        return None
    try:
        # Skip Google Maps photo references (need API key to render)
        if "maps.googleapis.com" in url and "photoreference" in url:
            return None
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
        return img
    except Exception as e:
        print(f"  ⚠ Could not download image: {e}")
        return None

def get_store_photo(store: dict) -> Optional[Image.Image]:
    photos = store.get("photos") or []
    for url in photos:
        img = download_image(url)
        if img:
            return img
    return None

def make_fallback_bg(color=(30, 30, 30)) -> Image.Image:
    img = Image.new("RGB", (W, H), color)
    return img

def fit_photo(photo: Image.Image, w=W, h=H) -> Image.Image:
    """Crop photo to fill canvas (center crop)."""
    ratio = max(w / photo.width, h / photo.height)
    new_w = int(photo.width * ratio)
    new_h = int(photo.height * ratio)
    photo = photo.resize((new_w, new_h), Image.LANCZOS)
    x = (new_w - w) // 2
    y = (new_h - h) // 2
    return photo.crop((x, y, x + w, y + h))

def add_gradient(img: Image.Image, strength="normal") -> Image.Image:
    """Add dark gradient overlay for text readability."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    if strength == "heavy":
        # Strong gradient — bottom 60%
        for i in range(H):
            progress = i / H
            if progress > 0.25:
                alpha = int(((progress - 0.25) / 0.75) ** 1.3 * 210)
                draw.line([(0, i), (W, i)], fill=(0, 0, 0, min(alpha, 210)))
        # Top 20% subtle dark
        for i in range(int(H * 0.20)):
            alpha = int((1 - i / (H * 0.20)) * 90)
            draw.line([(0, i), (W, i)], fill=(0, 0, 0, alpha))
    else:
        # Normal gradient — bottom 50%
        for i in range(H):
            progress = i / H
            if progress > 0.35:
                alpha = int(((progress - 0.35) / 0.65) ** 1.4 * 190)
                draw.line([(0, i), (W, i)], fill=(0, 0, 0, min(alpha, 190)))
        # Top subtle
        for i in range(int(H * 0.15)):
            alpha = int((1 - i / (H * 0.15)) * 70)
            draw.line([(0, i), (W, i)], fill=(0, 0, 0, alpha))

    result = img.convert("RGBA")
    result = Image.alpha_composite(result, overlay)
    return result.convert("RGB")

# ─── DRAWING HELPERS ──────────────────────────────────────────────────────────

def draw_corner_brackets(draw: ImageDraw.Draw, margin=40, size=60, thickness=3, color=CYAN):
    """Draw the signature cyan corner brackets."""
    m, s, t = margin, size, thickness
    # Top-left
    draw.rectangle([m, m, m+t, m+s], fill=color)
    draw.rectangle([m, m, m+s, m+t], fill=color)
    # Top-right
    draw.rectangle([W-m-t, m, W-m, m+s], fill=color)
    draw.rectangle([W-m-s, m, W-m, m+t], fill=color)
    # Bottom-left
    draw.rectangle([m, H-m-s, m+t, H-m], fill=color)
    draw.rectangle([m, H-m-t, m+s, H-m], fill=color)
    # Bottom-right
    draw.rectangle([W-m-t, H-m-s, W-m, H-m], fill=color)
    draw.rectangle([W-m-s, H-m-t, W-m, H-m], fill=color)

def draw_brand(draw: ImageDraw.Draw, color=CYAN, pos="top-left"):
    """Draw LOST IN TRANSIT wordmark."""
    font = FONTS["brand"]
    text = "LOST IN TRANSIT"
    if pos == "top-left":
        draw.text((62, 58), text, font=font, fill=color)
    elif pos == "top-right":
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((W - 62 - tw, 58), text, font=font, fill=color)

def draw_lot_logo(draw: ImageDraw.Draw, x=None, y=None, size=42, color=CYAN):
    """Intentionally blank — only cover slide gets the wordmark."""
    pass

def draw_text_wrapped(draw, text, x, y, max_width, font, fill, line_spacing=1.2):
    """Draw wrapped text and return the bottom Y position."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = (current + " " + word).strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    line_height = int((draw.textbbox((0, 0), "A", font=font)[3]) * line_spacing)
    cy = y
    for line in lines:
        draw.text((x, cy), line, font=font, fill=fill)
        cy += line_height
    return cy

def draw_store_bottom(draw, store_name, location_text, y_name=None, y_loc=None):
    """Draw store name + location at bottom left."""
    if y_name is None:
        y_name = H - 220
    if y_loc is None:
        y_loc = y_name + 95

    # Pick font size based on name length
    if len(store_name) > 18:
        name_font = FONTS["title_sm"]
        y_loc = y_name + 70
    elif len(store_name) > 12:
        name_font = FONTS["title_md"]
        y_loc = y_name + 82
    else:
        name_font = FONTS["title"]

    draw.text((62, y_name), store_name, font=name_font, fill=WHITE)
    draw.text((62, y_loc), location_text, font=FONTS["label"], fill=CYAN)

def draw_swipe_hint(draw, current, total):
    """Intentionally blank — no slide counter on posts."""
    pass

# ─── SLIDE BUILDERS ───────────────────────────────────────────────────────────

def build_photo_base(photo: Optional[Image.Image], gradient="normal") -> Image.Image:
    if photo:
        base = fit_photo(photo)
    else:
        base = make_fallback_bg()
    return add_gradient(base, gradient)

def slide_single_cover(store: dict, photo: Image.Image, hook_line: str, total: int) -> Image.Image:
    """Slide 1: Cover — hook line + store name + location."""
    base = build_photo_base(photo, gradient="heavy")
    draw = ImageDraw.Draw(base)

    draw_corner_brackets(draw)
    draw_brand(draw, color=CYAN, pos="top-left")
    draw_swipe_hint(draw, 1, total)

    # Layout from bottom up:
    # Location (cyan) at H-100, store name at H-210, hook above that
    loc = f"{store.get('city', '')} • {store.get('neighborhood', '')}" if store.get('neighborhood') else store.get('city', '')

    # Store name — pick font based on length
    if len(store['name']) > 18:
        name_font = FONTS["title_sm"]
        name_y    = H - 200
    elif len(store['name']) > 12:
        name_font = FONTS["title_md"]
        name_y    = H - 215
    else:
        name_font = FONTS["title"]
        name_y    = H - 230

    loc_y = name_y + name_font.size + 24
    draw.text((62, name_y), store['name'], font=name_font, fill=WHITE)
    draw.text((62, loc_y),  loc,           font=FONTS["label"], fill=CYAN)

    # Hook line — sits above the store name block with breathing room
    hook_y = name_y - 180
    draw_text_wrapped(draw, hook_line.lower(), 62, hook_y, W - 124, FONTS["hook"], WHITE)

    return base

def slide_single_info(store: dict, photo: Image.Image, caption: str, slide_num: int, total: int) -> Image.Image:
    """Interior info slide with caption overlay."""
    base = build_photo_base(photo, gradient="heavy")
    draw = ImageDraw.Draw(base)

    draw_corner_brackets(draw)
    # No wordmark on interior slides
    draw_swipe_hint(draw, slide_num, total)

    # Store name + location pinned to bottom
    loc = f"{store.get('city', '')} • {store.get('neighborhood', '')}" if store.get('neighborhood') else store.get('city', '')
    name_y = H - 140
    loc_y  = name_y + FONTS["title_sm"].size + 14
    draw.text((62, name_y), store['name'], font=FONTS["title_sm"], fill=WHITE)
    draw.text((62, loc_y),  loc,           font=FONTS["label_sm"], fill=CYAN)

    # Caption sits above the store name block with breathing room
    caption_y = name_y - 220
    draw_text_wrapped(draw, caption.lower(), 62, caption_y, W - 124, FONTS["caption"], WHITE)

    return base

def slide_address(store: dict, photo: Image.Image, slide_num: int, total: int) -> Image.Image:
    """Address + hours slide — photo shows through, panel at bottom."""
    base = build_photo_base(photo, gradient="normal")  # lighter gradient so photo shows
    draw = ImageDraw.Draw(base)

    draw_corner_brackets(draw)
    # No wordmark on interior slides

    # Smaller panel — just enough for the text content
    panel_y = H - 380
    panel = Image.new("RGBA", (W, H - panel_y), (11, 15, 25, 210))
    base.paste(panel, (0, panel_y), panel)

    draw = ImageDraw.Draw(base)

    # "find us here" label
    draw.text((62, panel_y + 28), "find us here", font=FONTS["label"], fill=CYAN)

    # Shorten address — strip the long suffix after the JP postal code
    address = store.get("address", "")
    if "," in address:
        parts = [p.strip() for p in address.split(",")]
        # Keep: street + ward/city only (first 3 parts)
        short_addr = ", ".join(p for p in parts[:3] if p)
    else:
        short_addr = _trim_to_words(address, 80)

    y = draw_text_wrapped(draw, short_addr, 62, panel_y + 76, W - 124, FONTS["body"], WHITE)

    # Hours
    hours = store.get("hours")
    if hours and y < H - 130:
        lines = [l for l in hours.strip().split("\n") if l.strip()][:3]
        draw.text((62, y + 20), "hours", font=FONTS["label_sm"], fill=CYAN)
        yy = y + 56
        for line in lines:
            if yy < H - 80:
                draw.text((62, yy), line, font=FONTS["body_sm"], fill=WHITE)
                yy += 38

    # Instagram handle at very bottom if it fits
    ig = store.get("instagram")
    if ig:
        draw.text((62, H - 68), ig, font=FONTS["label_sm"], fill=CYAN)

    draw_swipe_hint(draw, slide_num, total)

    return base

def slide_cta() -> Image.Image:
    """Final CTA slide — dark with branding, vertically balanced."""
    base = Image.new("RGB", (W, H), DARK)
    draw = ImageDraw.Draw(base)

    draw_corner_brackets(draw, color=CYAN)

    cx = W // 2

    # Content block centered at 55% down (slightly below center = feels grounded)
    cy = int(H * 0.52)

    # Top cyan rule
    draw.rectangle([62, cy - 220, W - 62, cy - 217], fill=CYAN)

    # "LOST IN TRANSIT" label — small, spaced above
    brand_text = "LOST IN TRANSIT"
    bbox = draw.textbbox((0, 0), brand_text, font=FONTS["brand"])
    bw = bbox[2] - bbox[0]
    draw.text((cx - bw // 2, cy - 190), brand_text, font=FONTS["brand"], fill=CYAN)

    # Big handle — the main focal element
    handle = "@lostintransit.japan"
    bbox2 = draw.textbbox((0, 0), handle, font=FONTS["title_sm"])
    hw = bbox2[2] - bbox2[0]
    draw.text((cx - hw // 2, cy - 110), handle, font=FONTS["title_sm"], fill=WHITE)

    # Website
    site = "lostintransitjp.com"
    bbox3 = draw.textbbox((0, 0), site, font=FONTS["label"])
    sw = bbox3[2] - bbox3[0]
    draw.text((cx - sw // 2, cy + 20), site, font=FONTS["label"], fill=CYAN)

    # CTA line
    cta = "save this post · follow for more Japan finds"
    bbox4 = draw.textbbox((0, 0), cta, font=FONTS["body_sm"])
    cw = bbox4[2] - bbox4[0]
    draw.text((cx - cw // 2, cy + 96), cta, font=FONTS["body_sm"], fill=(160, 160, 170))

    # Bottom cyan rule
    draw.rectangle([62, cy + 152, W - 62, cy + 155], fill=CYAN)

    return base

def slide_multi_cover(title: str, subtitle: str, photo: Optional[Image.Image], total_stores: int) -> Image.Image:
    """Cover slide for multi-store carousels."""
    if photo:
        base = build_photo_base(photo, gradient="heavy")
    else:
        base = make_fallback_bg((15, 15, 20))

    draw = ImageDraw.Draw(base)
    draw_corner_brackets(draw)
    draw_brand(draw, color=CYAN, pos="top-left")

    # Title
    draw_text_wrapped(draw, title.lower(), 62, H - 310, W - 124, FONTS["title_md"], WHITE)

    # Subtitle (neighborhood/city)
    draw.text((62, H - 115), subtitle, font=FONTS["label"], fill=CYAN)

    return base

def slide_multi_store(store: dict, photo: Image.Image, slide_num: int, total: int, one_liner: str) -> Image.Image:
    """Single store slide within a multi-store carousel."""
    base = build_photo_base(photo, gradient="heavy")
    draw = ImageDraw.Draw(base)

    draw_corner_brackets(draw)
    # No wordmark on interior slides
    draw_swipe_hint(draw, slide_num, total)

    # One-liner caption
    if one_liner:
        draw_text_wrapped(draw, one_liner.lower(), 62, H - 390, W - 124, FONTS["caption_sm"], WHITE)

    # Store name + location
    loc = f"{store.get('city', '')} • {store.get('neighborhood', '')}" if store.get('neighborhood') else store.get('city', '')
    draw_store_bottom(draw, store['name'], loc)

    return base

# ─── ONE-LINER GENERATOR ──────────────────────────────────────────────────────

def _trim_to_words(text: str, max_chars: int) -> str:
    """Trim text at a word boundary — never cuts mid-word."""
    if len(text) <= max_chars:
        return text
    trimmed = text[:max_chars]
    last_space = trimmed.rfind(" ")
    if last_space > max_chars // 2:
        trimmed = trimmed[:last_space]
    return trimmed.rstrip(",.;:—-") + "..."

def make_one_liner(store: dict) -> str:
    """Generate a short punchy one-liner from store description."""
    desc = store.get("description", "")
    cats = store.get("categories", []) or []

    if not desc:
        cat_str = cats[0] if cats else "store"
        return f"{cat_str} in {store.get('neighborhood', store.get('city', ''))}"

    # Pull first clean sentence
    first = desc.split(".")[0].strip()
    return _trim_to_words(first, 72).lower()

def make_hook_line(store: dict) -> str:
    """Generate a SHORT punchy hook for the cover slide (aim for 5-8 words)."""
    desc = store.get("description", "")
    cats = store.get("categories", []) or []
    neighborhood = store.get("neighborhood", "")
    name = store.get("name", "")

    sentences = [s.strip() for s in desc.split(".") if len(s.strip()) > 20]

    # Try to find a short, punchy sentence — prefer sentences under 50 chars
    hook = None
    for s in sentences:
        if 15 < len(s) <= 55:
            hook = s
            break

    # Fall back to trimming the best sentence we have
    if not hook:
        if len(sentences) >= 2:
            hook = sentences[1]
        elif sentences:
            hook = sentences[0]
        else:
            hook = f"a {cats[0].lower() if cats else 'fashion'} destination in {neighborhood}"

    # Keep it short — max 52 chars for a punchy hook
    return _trim_to_words(hook, 52).lower()

# ─── CAROUSEL BUILDERS ────────────────────────────────────────────────────────

def build_single_store_carousel(store: dict, output_dir: str):
    """Build a 5-slide single store spotlight carousel."""
    print(f"\n📸 Building single store carousel: {store['name']}")
    os.makedirs(output_dir, exist_ok=True)

    photos_raw = store.get("photos") or []
    photos = []
    print(f"  Downloading up to {min(4, len(photos_raw))} photos...")
    for url in photos_raw[:4]:
        img = download_image(url)
        if img:
            photos.append(img)
            print(f"  ✓ Downloaded photo {len(photos)}")
        if len(photos) >= 4:
            break

    # Fallback if no photos
    while len(photos) < 4:
        photos.append(None)

    hook = make_hook_line(store)
    one_liner_2 = make_one_liner(store)
    total = 5

    slides = [
        ("01_cover",   slide_single_cover(store, photos[0], hook, total)),
        ("02_info",    slide_single_info(store, photos[1] or photos[0], one_liner_2, 2, total)),
        ("03_detail",  slide_single_info(store, photos[2] or photos[0],
                       (store.get("description", "").split(".")[2] or one_liner_2).strip().lower()[:80], 3, total)),
        ("04_address", slide_address(store, photos[3] or photos[0], 4, total)),
        ("05_cta",     slide_cta()),
    ]

    store_slug = store['name'].lower().replace(" ", "_").replace("/", "_")[:30]
    for name, slide in slides:
        path = os.path.join(output_dir, f"{store_slug}_{name}.png")
        slide.save(path, "PNG", quality=95)
        print(f"  ✓ Saved {name}.png")

    print(f"\n✅ Single store carousel complete → {output_dir}")

def build_multi_store_carousel(title: str, subtitle: str, stores: list, output_dir: str):
    """Build a multi-store roundup carousel."""
    print(f"\n📸 Building multi-store carousel: {title}")
    os.makedirs(output_dir, exist_ok=True)

    total = len(stores) + 2  # cover + stores + CTA

    # Cover photo = first store's photo
    cover_photo = None
    for s in stores:
        urls = s.get("photos") or []
        for url in urls:
            img = download_image(url)
            if img:
                cover_photo = img
                break
        if cover_photo:
            break

    cover = slide_multi_cover(title, subtitle, cover_photo, len(stores))
    cover.save(os.path.join(output_dir, "00_cover.png"), "PNG")
    print("  ✓ Saved cover slide")

    for i, store in enumerate(stores, 1):
        print(f"  Downloading photo for: {store['name']}...")
        photo = get_store_photo(store)
        one_liner = make_one_liner(store)
        slide = slide_multi_store(store, photo, i + 1, total, one_liner)
        slug = f"{i:02d}_{store['name'].lower().replace(' ', '_')[:20]}"
        path = os.path.join(output_dir, f"{slug}.png")
        slide.save(path, "PNG")
        print(f"  ✓ Saved slide {i}: {store['name']}")

    cta = slide_cta()
    cta.save(os.path.join(output_dir, f"{len(stores)+1:02d}_cta.png"), "PNG")
    print(f"  ✓ Saved CTA slide")

    print(f"\n✅ Multi-store carousel complete ({total} slides) → {output_dir}")

# ─── TEXT REVIEW / EDIT ───────────────────────────────────────────────────────

def review_text(label: str, current: str) -> str:
    """Show proposed text and let user approve or replace it."""
    print(f"\n  [{label}]")
    print(f"  → {current}")
    edit = input("  Keep this? (Enter to keep, or type replacement): ").strip()
    return edit if edit else current

def review_single_store_text(store: dict) -> dict:
    """Let user review/edit all text before generating slides."""
    print("\n" + "-"*50)
    print("  REVIEW SLIDE TEXT")
    print("  (Press Enter to keep, or type your own)")
    print("  Tip: Slide 1 hook = short & punchy (5-8 words)")
    print("       Slides 2-3 = 1-2 sentences, keep it snappy")
    print("-"*50)

    hook = review_text("Slide 1 — Hook (keep it SHORT, ~5-8 words)", make_hook_line(store))

    desc  = store.get("description", "")
    sents = [s.strip() for s in desc.split(".") if len(s.strip()) > 15]
    # Use word-boundary trimmed versions for review — no raw char slicing
    cap2_default = _trim_to_words(sents[1], 72).lower() if len(sents) > 1 else make_one_liner(store)
    cap3_default = _trim_to_words(sents[2], 72).lower() if len(sents) > 2 else make_one_liner(store)

    cap2 = review_text("Slide 2 — Caption", cap2_default)
    cap3 = review_text("Slide 3 — Caption", cap3_default)

    return {"hook": hook, "cap2": cap2, "cap3": cap3}

def review_multi_store_text(title: str, subtitle: str, stores: list) -> tuple:
    """Let user review/edit carousel title and per-store one-liners."""
    print("\n" + "-"*50)
    print("  REVIEW SLIDE TEXT")
    print("  (Press Enter to keep, or type your own)")
    print("-"*50)

    title    = review_text("Cover — Title", title)
    subtitle = review_text("Cover — Location/Subtitle", subtitle)

    one_liners = []
    for store in stores:
        liner = review_text(f"{store['name']} — One-liner caption", make_one_liner(store))
        one_liners.append(liner)

    return title, subtitle, one_liners

# ─── CAROUSEL BUILDERS (updated with review) ──────────────────────────────────

def build_single_store_carousel_v2(store: dict, output_dir: str):
    """Build a 5-slide single store spotlight carousel with text review."""
    print(f"\n📸 Building single store carousel: {store['name']}")

    # Review text before generating
    texts = review_single_store_text(store)

    os.makedirs(output_dir, exist_ok=True)

    photos_raw = store.get("photos") or []
    photos = []
    print(f"\n  Downloading photos...")
    for url in photos_raw[:4]:
        img = download_image(url)
        if img:
            photos.append(img)
            print(f"  ✓ Photo {len(photos)}")
        if len(photos) >= 4:
            break
    while len(photos) < 4:
        photos.append(None)

    total = 5
    slides = [
        ("01_cover",   slide_single_cover(store, photos[0], texts["hook"], total)),
        ("02_info",    slide_single_info(store, photos[1] or photos[0], texts["cap2"], 2, total)),
        ("03_detail",  slide_single_info(store, photos[2] or photos[0], texts["cap3"], 3, total)),
        ("04_address", slide_address(store, photos[3] or photos[0], 4, total)),
        ("05_cta",     slide_cta()),
    ]

    store_slug = store['name'].lower().replace(" ", "_").replace("/", "_")[:30]
    for name, slide in slides:
        path = os.path.join(output_dir, f"{store_slug}_{name}.png")
        slide.save(path, "PNG", quality=95)
        print(f"  ✓ Saved {name}.png")

    print(f"\n✅ Done! {total} slides saved to:")
    print(f"   {output_dir}")

def build_multi_store_carousel_v2(title: str, subtitle: str, stores: list, output_dir: str):
    """Build a multi-store roundup carousel with text review."""
    print(f"\n📸 Building multi-store carousel: {title}")

    # Review text
    title, subtitle, one_liners = review_multi_store_text(title, subtitle, stores)

    os.makedirs(output_dir, exist_ok=True)
    total = len(stores) + 2

    # Cover photo
    cover_photo = None
    for s in stores:
        for url in (s.get("photos") or []):
            img = download_image(url)
            if img:
                cover_photo = img
                break
        if cover_photo:
            break

    print("\n  Generating slides...")
    cover = slide_multi_cover(title, subtitle, cover_photo, len(stores))
    cover.save(os.path.join(output_dir, "00_cover.png"), "PNG")
    print("  ✓ Cover slide")

    for i, (store, liner) in enumerate(zip(stores, one_liners), 1):
        photo = get_store_photo(store)
        slide = slide_multi_store(store, photo, i + 1, total, liner)
        slug = f"{i:02d}_{store['name'].lower().replace(' ', '_')[:20]}"
        slide.save(os.path.join(output_dir, f"{slug}.png"), "PNG")
        print(f"  ✓ Slide {i}: {store['name']}")

    cta = slide_cta()
    cta.save(os.path.join(output_dir, f"{len(stores)+1:02d}_cta.png"), "PNG")
    print(f"  ✓ CTA slide")

    print(f"\n✅ Done! {total} slides saved to:")
    print(f"   {output_dir}")

# ─── MAIN INTERFACE ───────────────────────────────────────────────────────────

def main():
    print("\n" + "="*50)
    print("  LOST IN TRANSIT — Carousel Generator")
    print("="*50)

    print("\nWhat type of carousel?")
    print("  1. Single Store Spotlight")
    print("  2. Multi-Store Roundup (you pick stores)")
    print("  3. Multi-Store Roundup (suggest from DB)")
    choice = input("\nEnter 1, 2, or 3: ").strip()

    if choice == "1":
        name = input("\nStore name: ").strip()
        store = fetch_store_by_name(name)
        if not store:
            print(f"❌ Store '{name}' not found in database.")
            return
        print(f"✓ Found: {store['name']} in {store.get('city')}")
        out = os.path.join(OUTPUT_DIR, store['name'].replace(" ", "_")[:30])
        build_single_store_carousel_v2(store, out)

    elif choice == "2":
        title    = input("\nCarousel title (e.g. '5 archive stores in Kobe'): ").strip()
        subtitle = input("Subtitle / location (e.g. 'Kobe, Japan'): ").strip()
        print("Enter store names one per line. Empty line when done:")
        store_names = []
        while True:
            s = input("  Store name: ").strip()
            if not s:
                break
            store_names.append(s)

        stores = []
        for n in store_names:
            store = fetch_store_by_name(n)
            if store:
                stores.append(store)
                print(f"  ✓ Found: {store['name']}")
            else:
                print(f"  ⚠ Not found: {n}")

        if not stores:
            print("❌ No stores found.")
            return

        slug = title.lower().replace(" ", "_")[:40]
        out  = os.path.join(OUTPUT_DIR, slug)
        build_multi_store_carousel_v2(title, subtitle, stores, out)

    elif choice == "3":
        print("\nFilter stores from database:")
        city         = input("City (e.g. Tokyo, Kobe) or blank for all: ").strip() or None
        neighborhood = input("Neighborhood or blank for all: ").strip() or None
        category     = input("Category (e.g. vintage, archive, coffee) or blank: ").strip() or None
        count        = int(input("How many stores (3-8): ").strip() or "5")
        title        = input("Carousel title: ").strip()
        subtitle     = input("Subtitle / location: ").strip()

        stores = fetch_stores_by_filter(city=city, neighborhood=neighborhood,
                                        categories=category, limit=count)
        if not stores:
            print("❌ No stores found with those filters.")
            return

        print(f"\n✓ Found {len(stores)} stores:")
        for s in stores:
            print(f"  • {s['name']} ({s.get('neighborhood')}, {s.get('city')})")

        confirm = input("\nLooks good? (y/n): ").strip().lower()
        if confirm != "y":
            print("Cancelled.")
            return

        slug = title.lower().replace(" ", "_")[:40]
        out  = os.path.join(OUTPUT_DIR, slug)
        build_multi_store_carousel_v2(title, subtitle, stores, out)

    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
