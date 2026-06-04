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
import re
import sys
import json
import textwrap
import unicodedata
import requests
from typing import Optional
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from supabase import create_client

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://avhtmmmblkjvinhhddzq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aHRtbW1ibGtqdmluaGhkZHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzQ3MjMsImV4cCI6MjA3NTAxMDcyM30.brC2CbIgMe-XW9yr6xZPRBFGRe5rZxSZ0nLzj-CFipw"

# Font search order — first directory that contains Inter-ExtraBold.ttf wins
_FONT_SEARCH_PATHS = [
    "/Users/alexcoluna/lost_in_transit_fonts",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts"),
    os.path.expanduser("~/Library/Fonts"),
    "/Library/Fonts",
    "/System/Library/Fonts/Supplemental",
]
FONT_DIR = next(
    (p for p in _FONT_SEARCH_PATHS if os.path.isfile(os.path.join(p, "Inter-ExtraBold.ttf"))),
    None  # None means Inter not found — will use system bold fallback below
)

# System bold font fallback (guaranteed on macOS) used when Inter isn't installed
_SYSTEM_BOLD_PATHS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]
_SYSTEM_BOLD = next((p for p in _SYSTEM_BOLD_PATHS if os.path.isfile(p)), None)

OUTPUT_DIR = os.path.expanduser("~/Desktop/carousel_output")

# Canvas size — Instagram portrait
W, H = 1080, 1350

# Brand colors
CYAN     = (0, 217, 255)        # #00D9FF
WHITE    = (255, 255, 255)
BLACK    = (0, 0, 0)
DARK     = (11, 15, 25)         # #0b0f19
GRAY     = (107, 114, 128)      # muted

# ─── TEXT CLEANING ────────────────────────────────────────────────────────────
# Inter font only covers Latin characters. Japanese/Chinese/Korean (CJK) glyphs
# render as empty boxes. We strip them before drawing and fall back to the
# English portion of any address or hours string.

def strip_cjk(text: str) -> str:
    """Remove CJK characters that Inter can't render."""
    if not text:
        return ""
    return re.sub(
        r'[　-〿぀-ゟ゠-ヿ'
        r'一-鿿＀-￯ㇰ-ㇿ]+',
        '', text
    ).strip()

def clean_render_text(text: str) -> str:
    """
    Prepare any string for PIL rendering:
      • Strip CJK characters
      • Normalize em/en dashes to a simple hyphen
      • Collapse leftover whitespace and orphan commas
    """
    if not text:
        return ""
    text = strip_cjk(text)
    text = text.replace('–', '-').replace('—', '-').replace('−', '-')
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r',\s*,+', ',', text)
    text = text.strip(', ')
    return text.strip()

def extract_english_address(address: str) -> str:
    """
    From a mixed Japanese/English address, keep only the English-readable parts.
    Splits on commas, drops chunks that are mostly CJK, rejoins the rest.
    """
    if not address:
        return ""
    has_cjk = bool(re.search(
        r'[぀-ゟ゠-ヿ一-鿿]', address
    ))
    if not has_cjk:
        return address

    parts = address.split(",")
    english_parts = []
    for part in parts:
        cleaned = strip_cjk(part).strip()
        # Keep the part if it has meaningful Latin content (numbers/letters)
        if re.search(r'[A-Za-z0-9]', cleaned) and len(cleaned) > 1:
            english_parts.append(cleaned)

    if english_parts:
        result = ", ".join(english_parts)
        result = re.sub(r'\s{2,}', ' ', result)
        return result.strip(', ')

    # Last resort — strip everything that can't render
    return clean_render_text(address)

def is_address_sentence(text: str) -> bool:
    """
    Return True if a sentence reads like a location description rather than
    editorial copy. Used to skip bad fallback captions.
    """
    lower = text.lower()
    triggers = [
        'located at', 'located in', 'is at', 'can be found at', 'is located',
        'address', 'chome', 'chōme', 'japan', '-ku ', ' ward',
        '丁目', '区', '都', '市',   # 丁目 区 都 市
    ]
    return any(t in lower for t in triggers)

# ─── FONTS ────────────────────────────────────────────────────────────────────

def load_fonts(scale: float = 1.0):
    """
    Load Inter fonts at the given scale factor (1.0 = default sizes).
    Searches _FONT_SEARCH_PATHS for Inter. If Inter isn't installed, falls back
    to a real system bold font so text is still large and readable.
    scale=0.8 makes everything 20% smaller; scale=1.3 makes it 30% bigger.
    """
    def sz(base):
        return max(10, int(base * scale))

    def inter(variant, base):
        """Try to load Inter variant. Falls back to system bold, then PIL default."""
        size = sz(base)
        # 1. Try Inter from FONT_DIR
        if FONT_DIR:
            try:
                return ImageFont.truetype(os.path.join(FONT_DIR, variant), size)
            except Exception:
                pass
        # 2. Fall back to system bold font (still readable at correct size)
        if _SYSTEM_BOLD:
            try:
                return ImageFont.truetype(_SYSTEM_BOLD, size)
            except Exception:
                pass
        # 3. Last resort — PIL bitmap (will be tiny, but won't crash)
        return ImageFont.load_default()

    return {
        "title":      inter("Inter-ExtraBold.ttf", 108),
        "title_md":   inter("Inter-ExtraBold.ttf", 86),
        "title_sm":   inter("Inter-ExtraBold.ttf", 66),
        "hook":       inter("Inter-ExtraBold.ttf", 112),
        "caption":    inter("Inter-Bold.ttf",      52),
        "caption_sm": inter("Inter-Bold.ttf",      42),
        "body":       inter("Inter-Regular.ttf",   42),
        "body_sm":    inter("Inter-Regular.ttf",   36),
        "label":      inter("Inter-Bold.ttf",      46),
        "label_sm":   inter("Inter-Medium.ttf",    36),
        "brand":      inter("Inter-ExtraBold.ttf", 44),
        "brand_sm":   inter("Inter-Bold.ttf",      32),
        "swipe":      inter("Inter-Medium.ttf",    30),
        "counter":    inter("Inter-Bold.ttf",      32),
    }

FONTS = load_fonts()

def get_font_status() -> dict:
    """Returns a dict describing which font source is active. Used in the UI."""
    if FONT_DIR:
        return {"status": "inter", "path": FONT_DIR}
    elif _SYSTEM_BOLD:
        return {"status": "system", "path": _SYSTEM_BOLD}
    else:
        return {"status": "fallback", "path": "PIL default (tiny — install Inter fonts)"}

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

# ─── CATEGORY SYSTEM ─────────────────────────────────────────────────────────
# Six categories matching the Lost in Transit map legend.
# Each entry stores the brand RGB color, hex string, display label, and the
# short abbreviation drawn inside the badge circle on slides.

CATEGORY_CONFIG = {
    "fashion":    {"rgb": (0, 180, 216),   "hex": "#00B4D8", "label": "Fashion",    "abbr": "F"},
    "food":       {"rgb": (244, 84, 27),   "hex": "#F4541B", "label": "Food",       "abbr": "FD"},
    "coffee":     {"rgb": (139, 90, 43),   "hex": "#8B5A2B", "label": "Coffee",     "abbr": "C"},
    "home goods": {"rgb": (245, 184, 0),   "hex": "#F5B800", "label": "Home Goods", "abbr": "HG"},
    "museum":     {"rgb": (123, 97, 255),  "hex": "#7B61FF", "label": "Museum",     "abbr": "M"},
    "spots":      {"rgb": (0, 176, 155),   "hex": "#00B09B", "label": "Spots",      "abbr": "S"},
}


def get_category_key(categories: list) -> Optional[str]:
    """
    Return the CATEGORY_CONFIG key that best matches the store's category list.
    Matching is case-insensitive and checks for substring overlap.
    Returns None if no match is found.
    """
    if not categories:
        return None
    for cat in categories:
        cat_lower = cat.lower().strip()
        for key in CATEGORY_CONFIG:
            # Exact or prefix match (e.g. "fashion" matches "fashion wear")
            if key == cat_lower or cat_lower.startswith(key[:3]) or key.startswith(cat_lower[:3]):
                return key
    return None


def draw_category_badge(
    draw: ImageDraw.Draw,
    category_key: str,
    x: int,
    y: int,
    size: int = 88,
):
    """
    Draw a circular category badge at position (x, y) with a diameter of `size`.
    The circle is filled with the category brand color and shows a short
    abbreviation in white text at the center.

    Positioned at the bottom-right of the slide content area (inside the
    corner bracket) so it doesn't interfere with the store name / location
    text block on the left.

    Parameters
    ----------
    draw         : PIL ImageDraw.Draw instance
    category_key : key from CATEGORY_CONFIG (e.g. 'fashion', 'coffee')
    x, y         : top-left of the bounding square for the circle
    size         : badge diameter in pixels (PIL canvas space)
    """
    cfg = CATEGORY_CONFIG.get(category_key)
    if not cfg:
        return

    r  = size // 2
    cx = x + r
    cy = y + r

    # Filled circle with category color
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=cfg["rgb"])

    # Abbreviation text centred inside the circle
    abbr      = cfg["abbr"]
    font_size = max(16, int(size * 0.40))
    font      = None
    if _SYSTEM_BOLD:
        try:
            font = ImageFont.truetype(_SYSTEM_BOLD, font_size)
        except Exception:
            pass
    font = font or ImageFont.load_default()

    bbox = draw.textbbox((0, 0), abbr, font=font)
    tw   = bbox[2] - bbox[0]
    th   = bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2 - 1), abbr, font=font, fill=WHITE)


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

    if strength == "cover":
        # Cover slide: base tint across full image so hook text is always readable
        # even in the bright mid-zone of the photo, plus a strong bottom gradient.
        draw.rectangle([(0, 0), (W, H)], fill=(0, 0, 0, 90))   # 35% tint overall
        for i in range(H):
            progress = i / H
            if progress > 0.45:
                alpha = int(((progress - 0.45) / 0.55) ** 1.2 * 180)
                draw.line([(0, i), (W, i)], fill=(0, 0, 0, min(alpha, 180)))
        # Top vignette
        for i in range(int(H * 0.18)):
            alpha = int((1 - i / (H * 0.18)) * 80)
            draw.line([(0, i), (W, i)], fill=(0, 0, 0, alpha))

    elif strength == "heavy":
        # Info/detail slides: strong bottom gradient
        for i in range(H):
            progress = i / H
            if progress > 0.25:
                alpha = int(((progress - 0.25) / 0.75) ** 1.3 * 210)
                draw.line([(0, i), (W, i)], fill=(0, 0, 0, min(alpha, 210)))
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

def draw_text_wrapped(draw, text, x, y, max_width, font, fill, line_spacing=1.2, max_lines=None):
    """
    Draw wrapped text starting at (x, y) going downward. Returns the bottom Y position.
    max_lines: if set, truncates to that many lines and adds '…' to the last one.
    """
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

    # Enforce line limit — truncate and add ellipsis if needed
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        # Trim last line and append ellipsis, making sure it still fits
        last = lines[-1]
        while last:
            test = last.rstrip() + "…"
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_width:
                lines[-1] = test
                break
            last = last.rsplit(" ", 1)[0]

    line_height = int((draw.textbbox((0, 0), "A", font=font)[3]) * line_spacing)
    cy = y
    for line in lines:
        draw.text((x, cy), line, font=font, fill=fill)
        cy += line_height
    return cy

def draw_store_bottom(draw, store_name, location_text, y_name=None, y_loc=None):
    """Draw store name + location at bottom left — text is always cleaned before drawing."""
    loc_y_base = H - 100
    if y_loc is None:
        y_loc = loc_y_base
    if y_name is None:
        if len(store_name) > 22:
            name_font = FONTS["title_sm"]   # 66px
            y_name = y_loc - 86
        elif len(store_name) > 14:
            name_font = FONTS["title_md"]   # 86px
            y_name = y_loc - 108
        else:
            name_font = FONTS["title"]      # 108px
            y_name = y_loc - 132
    else:
        if len(store_name) > 22:
            name_font = FONTS["title_sm"]
        elif len(store_name) > 14:
            name_font = FONTS["title_md"]
        else:
            name_font = FONTS["title"]

    draw.text((62, y_name), store_name, font=name_font, fill=WHITE)
    draw.text((62, y_loc), clean_render_text(location_text).upper(), font=FONTS["label"], fill=CYAN)

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

def get_slide_background(
    photo: Optional[Image.Image],
    gradient: str = "normal",
    with_brackets: bool = True,
    resize_to: Optional[tuple] = None,
) -> Image.Image:
    """
    Return a slide background (photo + gradient + optional corner brackets)
    with NO text rendered on it.  Used by the canvas editor to provide the
    base layer that Fabric.js text objects sit on top of.

    Parameters
    ----------
    photo        : store photo (PIL Image) or None for solid fallback
    gradient     : 'cover' | 'heavy' | 'normal'
    with_brackets: draw the signature cyan corner brackets
    resize_to    : (width, height) tuple — downsample before returning.
                   Pass (540, 675) for the canvas display size to keep the
                   base64 payload small without affecting the canvas output.
    """
    base = build_photo_base(photo, gradient=gradient)
    if with_brackets:
        draw = ImageDraw.Draw(base)
        draw_corner_brackets(draw)
    if resize_to:
        base = base.resize(resize_to, Image.LANCZOS)
    return base

def slide_single_cover(
    store: dict,
    photo: Image.Image,
    hook_line: str,
    total: int,
    category_key: Optional[str] = None,
    with_brackets: bool = True,
) -> Image.Image:
    """
    Slide 1: Cover
    Layout (bottom → up):
      • CITY · NEIGHBORHOOD  (label, cyan, very bottom)
      • Store name           (title, white, above location)
      • [breathing room — photo shows through]
      • Hook line            (hook, white, upper-middle — the dominant element)
      • Brand mark           (brand, cyan, top-left)
      • Category badge       (colored circle, bottom-right inside bracket, optional)
    """
    base = build_photo_base(photo, gradient="cover")
    draw = ImageDraw.Draw(base)

    if with_brackets:
        draw_corner_brackets(draw)
    draw_brand(draw, color=CYAN, pos="top-left")

    # ── BOTTOM: Location (city · neighborhood) ─────────────────────────────
    loc = (
        f"{store.get('city', '')} · {store.get('neighborhood', '')}"
        if store.get('neighborhood')
        else store.get('city', '')
    )
    loc_y = H - 100
    draw.text((62, loc_y), loc.upper(), font=FONTS["label"], fill=CYAN)

    # ── BOTTOM: Store name — sits above location ────────────────────────────
    name = store.get('name', '')
    if len(name) > 22:
        name_font = FONTS["title_sm"]    # 66px
        name_gap  = 86
    elif len(name) > 14:
        name_font = FONTS["title_md"]    # 86px
        name_gap  = 108
    else:
        name_font = FONTS["title"]       # 108px
        name_gap  = 132
    name_y = loc_y - name_gap
    draw.text((62, name_y), name, font=name_font, fill=WHITE)

    # ── UPPER-MIDDLE: Hook — the dominant visual element ────────────────────
    clean_hook = clean_render_text(hook_line)
    hook_y = int(H * 0.33)
    draw_text_wrapped(
        draw, clean_hook.lower(), 62, hook_y,
        W - 124, FONTS["hook"], WHITE, line_spacing=1.22, max_lines=3
    )

    # ── BOTTOM-RIGHT: Category badge (inside bracket corner) ────────────────
    if category_key:
        badge_size = 88
        badge_x = W - 62 - badge_size      # right-aligned with bracket margin
        badge_y = H - 62 - badge_size      # sits just above bottom bracket
        draw_category_badge(draw, category_key, badge_x, badge_y, badge_size)

    return base

def slide_single_info(
    store: dict,
    photo: Image.Image,
    caption: str,
    slide_num: int,
    total: int,
    category_key: Optional[str] = None,
    with_brackets: bool = True,
) -> Image.Image:
    """Interior info slide — caption overlaid on photo with strong bottom gradient."""
    base = build_photo_base(photo, gradient="heavy")
    draw = ImageDraw.Draw(base)

    if with_brackets:
        draw_corner_brackets(draw)
    draw_swipe_hint(draw, slide_num, total)

    # ── Store identity — pinned to bottom with breathing room ──────────────
    loc = (
        f"{store.get('city', '')} · {store.get('neighborhood', '')}"
        if store.get('neighborhood')
        else store.get('city', '')
    )
    # Location label — 90px from bottom
    loc_y = H - 90
    draw.text((62, loc_y), loc.upper(), font=FONTS["label_sm"], fill=CYAN)

    # Store name — sits above location
    name = store.get('name', '')
    if len(name) > 22:
        name_font = FONTS["title_sm"]   # 66px
        name_y = loc_y - 86
    elif len(name) > 14:
        name_font = FONTS["title_md"]   # 86px
        name_y = loc_y - 108
    else:
        name_font = FONTS["title"]      # 108px
        name_y = loc_y - 132
    draw.text((62, name_y), name, font=name_font, fill=WHITE)

    # ── Caption — fixed anchor in upper-middle, capped so it never crowds the name ──
    clean_caption = clean_render_text(caption)
    caption_y = 560
    draw_text_wrapped(
        draw, clean_caption.lower(), 62, caption_y,
        W - 124, FONTS["caption"], WHITE, line_spacing=1.45, max_lines=4
    )

    # ── BOTTOM-RIGHT: Category badge (inside bracket corner) ────────────────
    if category_key:
        badge_size = 88
        badge_x = W - 62 - badge_size
        badge_y = H - 62 - badge_size
        draw_category_badge(draw, category_key, badge_x, badge_y, badge_size)

    return base

def slide_address(
    store: dict,
    photo: Image.Image,
    slide_num: int,
    total: int,
    with_brackets: bool = True,
) -> Image.Image:
    """
    Address slide — minimal float style matching the info/detail aesthetic.

    Layout (top → bottom within the gradient zone):
      Y ≈ 660  "find us here"  [CYAN label]
      Y ≈ 712  address text    [WHITE, caption_sm, max 2 lines]
      Y ≈ 870  "hours"         [CYAN label]
      Y ≈ 922  hours text      [WHITE body, max 2 lines]

    Bottom anchors (same as info/detail slides):
      store name              [WHITE title variant]
      instagram / location    [CYAN label — very bottom]
    """
    base = build_photo_base(photo, gradient="heavy")
    draw = ImageDraw.Draw(base)

    if with_brackets:
        draw_corner_brackets(draw)

    # ── ADDRESS block ─────────────────────────────────────────────────────────
    draw.text((62, 660), "find us here", font=FONTS["label_sm"], fill=CYAN)

    raw_address = store.get("address", "")
    address = extract_english_address(raw_address)
    if not address:
        address = "Address on map"
    addr_parts = [p.strip() for p in address.split(",") if p.strip()]
    if addr_parts and addr_parts[-1].lower() == "japan" and len(addr_parts) > 2:
        addr_parts = addr_parts[:-1]
    short_addr = ", ".join(addr_parts[:3])

    addr_end_y = draw_text_wrapped(
        draw, clean_render_text(short_addr),
        62, 712, W - 124, FONTS["caption_sm"], WHITE,
        line_spacing=1.35, max_lines=2,
    )

    # ── HOURS block ───────────────────────────────────────────────────────────
    hours_raw = store.get("hours", "")
    if hours_raw:
        hours_label_y = max(addr_end_y + 44, 870)
        draw.text((62, hours_label_y), "hours", font=FONTS["label_sm"], fill=CYAN)

        raw_lines  = hours_raw.strip().split("\n")
        hour_lines = [clean_render_text(l) for l in raw_lines if clean_render_text(l)]
        if hour_lines:
            # Join up to two lines with a centre-dot separator for a clean single block
            hours_str = "  ·  ".join(hour_lines[:2])
            draw_text_wrapped(
                draw, hours_str,
                62, hours_label_y + 52, W - 124, FONTS["body"], WHITE,
                line_spacing=1.35, max_lines=2,
            )

    # ── BOTTOM: Store identity ────────────────────────────────────────────────
    # Instagram handle takes the "location" anchor slot at the very bottom.
    # Store name sits directly above it, same gap as the info/detail slides.
    ig    = store.get("instagram", "")
    loc_y = H - 90

    if ig:
        draw.text((62, loc_y), clean_render_text(ig), font=FONTS["label"], fill=CYAN)
    else:
        loc = (
            f"{store.get('city', '')} · {store.get('neighborhood', '')}"
            if store.get('neighborhood')
            else store.get('city', '')
        )
        draw.text((62, loc_y), loc.upper(), font=FONTS["label_sm"], fill=CYAN)

    name = store.get('name', '')
    if len(name) > 22:
        name_font = FONTS["title_sm"]   # 66px
        name_y    = loc_y - 86
    elif len(name) > 14:
        name_font = FONTS["title_md"]   # 86px
        name_y    = loc_y - 108
    else:
        name_font = FONTS["title"]      # 108px
        name_y    = loc_y - 132
    draw.text((62, name_y), name, font=name_font, fill=WHITE)

    return base

def slide_cta() -> Image.Image:
    """
    Final CTA slide — premium branded end card.

    Layout spans the full 1350px height:
      y=200  → "LOST IN TRANSIT"  (title, white, centered) — brand hero
      y=355  → "your japan sourcing guide"  (label, gray, centered)
      y=465  → cyan rule
      y=530  → "@lostintransit.japan"  (large, CYAN, centered) — follow CTA
      y=680  → "daily finds from japan's best shops"  (caption_sm, muted)
      y=800  → cyan rule
      y=875  → "lostintransitjp.com"  (title_sm, white, centered)
      y=1010 → "save this post · share with someone planning a japan trip"  (label_sm, gray)
      y=1180 → three cyan dots  (visual rhythm / signature)
    """
    base = Image.new("RGB", (W, H), DARK)
    draw = ImageDraw.Draw(base)
    cx = W // 2

    draw_corner_brackets(draw, color=CYAN)

    # ── Brand hero ─────────────────────────────────────────────────────────
    brand = "LOST IN TRANSIT"
    b_bbox = draw.textbbox((0, 0), brand, font=FONTS["title"])
    draw.text((cx - (b_bbox[2] - b_bbox[0]) // 2, 200), brand, font=FONTS["title"], fill=WHITE)

    # ── Tagline ────────────────────────────────────────────────────────────
    tag = "your japan sourcing guide"
    t_bbox = draw.textbbox((0, 0), tag, font=FONTS["label"])
    draw.text((cx - (t_bbox[2] - t_bbox[0]) // 2, 358), tag, font=FONTS["label"], fill=GRAY)

    # ── Cyan rule ──────────────────────────────────────────────────────────
    draw.rectangle([62, 468, W - 62, 471], fill=CYAN)

    # ── Handle — biggest cyan element, centered ────────────────────────────
    handle = "@lostintransit.japan"
    # Try title_md first; fall back to title_sm if it overflows the margins
    for h_font_key in ("title_md", "title_sm", "caption"):
        h_font = FONTS[h_font_key]
        h_bbox = draw.textbbox((0, 0), handle, font=h_font)
        hw = h_bbox[2] - h_bbox[0]
        if hw <= W - 124:
            break
    draw.text((cx - hw // 2, 532), handle, font=h_font, fill=CYAN)

    # ── Sub-line ───────────────────────────────────────────────────────────
    sub = "daily finds from japan's best shops"
    s_bbox = draw.textbbox((0, 0), sub, font=FONTS["caption_sm"])
    sw = s_bbox[2] - s_bbox[0]
    draw.text((cx - sw // 2, 688), sub, font=FONTS["caption_sm"], fill=(165, 165, 175))

    # ── Cyan rule ──────────────────────────────────────────────────────────
    draw.rectangle([62, 810, W - 62, 813], fill=CYAN)

    # ── Website ────────────────────────────────────────────────────────────
    site = "lostintransitjp.com"
    si_bbox = draw.textbbox((0, 0), site, font=FONTS["title_sm"])
    siw = si_bbox[2] - si_bbox[0]
    draw.text((cx - siw // 2, 878), site, font=FONTS["title_sm"], fill=WHITE)

    # ── Save CTA ──────────────────────────────────────────────────────────
    cta = "save this post · share with someone planning a japan trip"
    draw_text_wrapped(draw, cta, 62, 1015, W - 124, FONTS["label_sm"],
                      (145, 145, 155), line_spacing=1.4, max_lines=2)

    # ── Three cyan dots — brand signature ─────────────────────────────────
    for dx in (-36, 0, 36):
        dot_x = cx + dx
        draw.ellipse([(dot_x - 6, 1188), (dot_x + 6, 1200)], fill=CYAN)

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
    draw_swipe_hint(draw, slide_num, total)

    # ── Store name + location ───────────────────────────────────────────────
    loc = (
        f"{store.get('city', '')} · {store.get('neighborhood', '')}"
        if store.get('neighborhood')
        else store.get('city', '')
    )
    draw_store_bottom(draw, store['name'], loc)

    # ── One-liner caption — sits above the name block ──────────────────────
    if one_liner:
        clean_liner = clean_render_text(one_liner)
        draw_text_wrapped(
            draw, clean_liner.lower(), 62, H - 430,
            W - 124, FONTS["caption_sm"], WHITE, line_spacing=1.3
        )

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
    """
    Generate a short punchy one-liner from store description.
    Skips any sentences that read like an address.
    """
    desc = store.get("description", "")
    cats = store.get("categories", []) or []
    neighborhood = store.get("neighborhood", "")
    city = store.get("city", "")

    if not desc:
        cat_str = cats[0] if cats else "store"
        return f"{cat_str} in {neighborhood or city}"

    sents = [s.strip() for s in desc.split(".") if len(s.strip()) > 15]

    # Find the first sentence that isn't an address
    for s in sents:
        if not is_address_sentence(s):
            cleaned = clean_render_text(s)
            if cleaned and len(cleaned) > 10:
                return _trim_to_words(cleaned, 72).lower()

    # Fallback: category + location — never an address
    cat_str = cats[0] if cats else "shop"
    return f"{cat_str} in {neighborhood or city}".lower()

def make_hook_line(store: dict) -> str:
    """
    Generate a SHORT punchy hook for the cover slide (aim for 5-8 words).
    Skips sentences that read like an address.
    """
    desc = store.get("description", "")
    cats = store.get("categories", []) or []
    neighborhood = store.get("neighborhood", "")

    sents = [s.strip() for s in desc.split(".") if len(s.strip()) > 15]

    # Prefer a short, punchy non-address sentence (15-55 chars)
    for s in sents:
        if not is_address_sentence(s) and 15 < len(s) <= 55:
            cleaned = clean_render_text(s)
            if cleaned:
                return _trim_to_words(cleaned, 52).lower()

    # Try any non-address sentence
    for s in sents:
        if not is_address_sentence(s):
            cleaned = clean_render_text(s)
            if cleaned:
                return _trim_to_words(cleaned, 52).lower()

    # Fallback — never expose an address as a hook
    cat_str = cats[0].lower() if cats else "fashion"
    return f"a {cat_str} destination in {neighborhood or 'japan'}"

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
