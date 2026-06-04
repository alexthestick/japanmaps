"""
Lost in Transit — Carousel Creator
====================================
Streamlit web app for generating branded Instagram carousel slides.

HOW TO RUN:
  cd ~/Desktop/Projects/Japan\ Maps
  streamlit run carousel_app.py

Opens automatically at http://localhost:8501

SECURITY:
  API keys live in a .env file — never hardcoded, never committed to git.
  Create a .env file based on .env.example before using AI features.
  The .env file is already listed in .gitignore.
"""

import streamlit as st
import io
import os
import zipfile
import json
import requests
from PIL import Image
from typing import Optional, List

# ─── LOAD ENVIRONMENT VARIABLES ───────────────────────────────────────────────
# python-dotenv reads .env from the current working directory.
# Keys become available via os.environ.get() — they are never printed or logged.

from dotenv import load_dotenv
load_dotenv()

# ─── PAGE CONFIG (must be the very first Streamlit call) ──────────────────────

st.set_page_config(
    page_title="Lost in Transit — Carousel Creator",
    page_icon="🗾",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── CUSTOM STYLING ───────────────────────────────────────────────────────────

st.markdown("""
<style>
    #MainMenu, footer { visibility: hidden; }

    .brand-header {
        color: #00D9FF;
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        margin-bottom: 0;
        line-height: 1;
    }
    .brand-sub {
        color: #6b7280;
        font-size: 0.85rem;
        letter-spacing: 0.08em;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
    }
    .slide-label {
        background: #0b0f19;
        color: #00D9FF;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        padding: 4px 10px;
        border-radius: 3px;
        display: inline-block;
        margin-bottom: 6px;
    }
    .tip {
        background: #1a2035;
        border-left: 3px solid #00D9FF;
        padding: 8px 12px;
        font-size: 0.8rem;
        color: #9ca3af;
        margin-bottom: 0.75rem;
        border-radius: 0 4px 4px 0;
    }
    .ai-suggestion {
        background: #f0fffe;
        border: 1px solid #00D9FF44;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.82rem;
        color: #374151;
        margin: 3px 0;
        font-style: italic;
    }
    div[data-testid="stButton"] > button[kind="primary"] {
        background-color: #00D9FF !important;
        color: #0b0f19 !important;
        font-weight: 800 !important;
        border: none !important;
        font-size: 1rem !important;
    }
    div[data-testid="stButton"] > button[kind="primary"]:hover {
        background-color: #00b8d9 !important;
    }
</style>
""", unsafe_allow_html=True)

# ─── IMPORTS FROM GENERATOR ───────────────────────────────────────────────────

import carousel_generator
from carousel_generator import (
    get_supabase,
    download_image,
    make_hook_line,
    make_one_liner,
    _trim_to_words,
    slide_single_cover,
    slide_single_info,
    slide_address,
    slide_cta,
    slide_multi_cover,
    slide_multi_store,
    load_fonts,
    get_font_status,
    get_slide_background,
    clean_render_text,
    get_category_key,
    CATEGORY_CONFIG,
    W, H,
)
from canvas_editor import render_canvas_editor

# ─── ANTHROPIC CLIENT ─────────────────────────────────────────────────────────

@st.cache_resource(show_spinner=False)
def get_anthropic_client():
    """
    Build the Anthropic client from the ANTHROPIC_API_KEY env var.
    Returns None if the key isn't set — AI features degrade gracefully
    and the rest of the app keeps working normally.

    The key is read once and cached. It is NEVER logged, printed,
    or stored anywhere other than the .env file on your machine.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        import anthropic
        return anthropic.Anthropic(api_key=api_key)
    except Exception:
        return None

ai_client = get_anthropic_client()
ai_enabled = ai_client is not None

# ─── AI COPY FUNCTIONS ────────────────────────────────────────────────────────
# Each function is cached with @st.cache_data so the same store never makes
# a duplicate API call within a session. TTL = 1 hour.
# Cost: ~$0.002 per call using Claude Haiku (< $0.20 for 100 carousels).

@st.cache_data(show_spinner=False, ttl=3600)
def ai_suggest_single(
    store_id: str,
    name: str,
    neighborhood: str,
    city: str,
    categories: str,
    description: str,
) -> dict:
    """
    Generate hook lines and captions for a Single Store carousel.
    Returns a dict with keys: hooks, info_captions, detail_captions.
    """
    client = get_anthropic_client()
    if not client:
        return {}

    prompt = f"""You are a social media copywriter for Lost in Transit JP — a Japan streetwear, vintage, and archive sourcing guide.
Brand voice: direct, knowledgeable, never hypey. Like a well-traveled friend who actually shops there.
Lowercase preferred. No exclamation marks. Never use "hidden gem", "must-visit", "one-of-a-kind", or tourist-speak.

Store: {name}
Location: {neighborhood}, {city}
Categories: {categories}
Description: {description}

Generate Instagram carousel copy. Return ONLY valid JSON, no other text:
{{
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "info_captions": ["info caption 1", "info caption 2"],
  "detail_captions": ["detail caption 1", "detail caption 2"]
}}

Rules:
- hooks: 5-8 words MAX, punchy and specific to this exact store (not generic), appears large on the cover slide
- info_captions: 1-2 short sentences — what makes this store unique or worth the visit, lowercase
- detail_captions: 1-2 short sentences — a different angle (what to find, price range, best section, what to look for), lowercase
- No period at the very end of captions"""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text
        # Claude sometimes adds preamble text before the JSON block.
        # Slice from the first { to the last } to extract just the JSON.
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            return {"error": "No JSON found in AI response"}
        return json.loads(raw[start:end])
    except Exception as e:
        return {"error": str(e)}


@st.cache_data(show_spinner=False, ttl=3600)
def ai_suggest_multi(theme: str, stores_json: str) -> dict:
    """
    Generate per-store one-liners for a Multi-Store Roundup.
    stores_json is a JSON string list so it's hashable for caching.
    Returns: { "one_liners": { "Store Name": "liner..." } }
    """
    client = get_anthropic_client()
    if not client:
        return {}

    stores = json.loads(stores_json)
    stores_text = "\n".join(
        f"- {s['name']} ({s.get('neighborhood') or s.get('city', '')}) "
        f"— {s.get('categories', '')} — {(s.get('description') or '')[:100]}"
        for s in stores
    )

    prompt = f"""You are a social media copywriter for Lost in Transit JP — a Japan streetwear/vintage sourcing guide.
Brand voice: direct, knowledgeable, lowercase, no hype.

Theme/title of this carousel: "{theme}"

Stores featured:
{stores_text}

For each store, write a one-liner (8-12 words) that fits the theme angle.
Each one-liner should feel like it belongs in this specific carousel, not a generic description.
Return ONLY valid JSON:
{{
  "one_liners": {{
    "Exact Store Name 1": "one liner here",
    "Exact Store Name 2": "one liner here"
  }}
}}"""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            return {"error": "No JSON found in AI response"}
        return json.loads(raw[start:end])
    except Exception as e:
        return {"error": str(e)}


@st.cache_data(show_spinner=False, ttl=3600)
def ai_suggest_neighborhood(neighborhood: str, city: str, stores_json: str) -> dict:
    """
    Generate editorial copy for a Neighborhood Guide carousel.
    Returns: { "hook": "...", "editorial": "...", "one_liners": { "Name": "..." } }
    """
    client = get_anthropic_client()
    if not client:
        return {}

    stores = json.loads(stores_json)
    store_names = ", ".join(s["name"] for s in stores)

    prompt = f"""You are a writer for Lost in Transit JP — a Japan streetwear/vintage/archive sourcing guide.
Brand voice: measured, editorial, honest. Like a Monocle byline meets a well-traveled buyer's notebook.
Lowercase preferred. No clichés. Never use "hidden gems", "must-visit", or tourist-speak.

Neighborhood: {neighborhood}, {city}
Stores featured: {store_names}

Generate neighborhood carousel copy. Return ONLY valid JSON:
{{
  "hook": "cover hook for the neighborhood (5-8 words, captures its character)",
  "editorial": "2-3 sentence opening that captures what makes this neighborhood worth exploring. Not just listing stores — capture the feel, the pace, the type of person who shops here.",
  "one_liners": {{
    "Exact Store Name 1": "8-12 word one-liner",
    "Exact Store Name 2": "8-12 word one-liner"
  }}
}}"""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            return {"error": "No JSON found in AI response"}
        return json.loads(raw[start:end])
    except Exception as e:
        return {"error": str(e)}


# ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

def pil_to_bytes(img: Image.Image) -> bytes:
    """Convert PIL image to PNG bytes for Streamlit display/download."""
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def make_zip(slides: List[tuple]) -> bytes:
    """Pack (filename, PIL Image) pairs into a ZIP file for bulk download."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, img in slides:
            img_buf = io.BytesIO()
            img.save(img_buf, format="PNG")
            zf.writestr(name, img_buf.getvalue())
    return buf.getvalue()


def thumb(img: Image.Image, size=(150, 180)) -> bytes:
    """Resize image to a small thumbnail for the photo picker grid."""
    t = img.copy()
    t.thumbnail(size, Image.LANCZOS)
    return pil_to_bytes(t)


def load_image_from_upload(uploaded_file) -> Optional[Image.Image]:
    """Convert a Streamlit file_uploader result to a PIL Image."""
    try:
        return Image.open(uploaded_file).convert("RGB")
    except Exception:
        return None


def load_image_from_url(url: str) -> Optional[Image.Image]:
    """Fetch an image from any URL and return as PIL Image."""
    try:
        # Try via carousel_generator's download_image first (handles ImageKit)
        img = download_image(url)
        if img:
            return img
        # Fallback: direct requests fetch
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception:
        return None


@st.cache_resource(show_spinner=False)
def get_all_stores():
    """Fetch all stores with photos from Supabase. Cached for the whole session."""
    sb = get_supabase()
    res = (
        sb.table("stores")
        .select("id, name, address, neighborhood, city, google_place_id, description, categories, hours, instagram, photos")
        .not_.is_("photos", "null")
        .order("name")
        .execute()
    )
    return [s for s in res.data if s.get("photos") and len(s["photos"]) > 0]


@st.cache_data(show_spinner=False, ttl=3600)
def load_photos(urls: tuple) -> List[Optional[Image.Image]]:
    """Download and cache up to 5 store photos by URL tuple."""
    return [download_image(url) for url in urls[:5]]


# ─── PHOTO PICKER WITH UPLOAD ─────────────────────────────────────────────────

def photo_picker_with_upload(
    photos: List[Optional[Image.Image]],
    label: str,
    state_key: str,
    default: int = 0,
) -> Optional[Image.Image]:
    """
    Three-source photo selector:
      📦 Database — photos already in Supabase for this store
      📤 Upload   — drag a file from your computer
      🔗 URL      — paste any image link (Instagram, Google, anywhere)

    Returns the selected PIL Image, or None if nothing is available.
    The selected image is what gets rendered into the slide.
    """
    custom_key = f"{state_key}_custom"
    db_idx_key = f"{state_key}_db_idx"

    st.caption(f"📸 {label}")
    tab_db, tab_upload, tab_url = st.tabs(["📦 Database", "📤 Upload", "🔗 URL"])

    # ── Tab 1: Database photos ──────────────────────────────────────────────
    with tab_db:
        valid = [(i, p) for i, p in enumerate(photos) if p is not None]
        if not valid:
            st.caption("No database photos for this store — use Upload or URL instead.")
        else:
            current_db = st.session_state.get(db_idx_key, default)
            using_custom = custom_key in st.session_state
            cols = st.columns(len(valid))
            for col, (i, photo) in zip(cols, valid):
                is_selected = (i == current_db) and not using_custom
                col.image(thumb(photo), use_container_width=True)
                btn_label = "✓ Active" if is_selected else f"Photo {i + 1}"
                if col.button(btn_label, key=f"{state_key}_db_{i}", use_container_width=True):
                    st.session_state[db_idx_key] = i
                    # Clear any custom photo so this db photo takes over
                    if custom_key in st.session_state:
                        del st.session_state[custom_key]
                    st.rerun()

    # ── Tab 2: Upload from disk ─────────────────────────────────────────────
    with tab_upload:
        uploaded = st.file_uploader(
            "Choose a photo from your computer",
            type=["jpg", "jpeg", "png", "webp"],
            key=f"{state_key}_uploader",
            label_visibility="collapsed",
        )
        if uploaded:
            img = load_image_from_upload(uploaded)
            if img:
                st.session_state[custom_key] = img
                st.image(thumb(img), width=140)
                st.caption("✓ Custom photo loaded — this will be used for the slide")
            else:
                st.error("Couldn't read that file. Try a JPG or PNG.")
        elif custom_key in st.session_state:
            # Show the currently active custom photo if one was previously loaded
            st.image(thumb(st.session_state[custom_key]), width=140)
            st.caption("✓ Custom photo active")
            if st.button("Clear custom photo", key=f"{state_key}_clear"):
                del st.session_state[custom_key]
                st.rerun()

    # ── Tab 3: Paste URL ────────────────────────────────────────────────────
    with tab_url:
        url_val = st.text_input(
            "Paste image URL",
            placeholder="https://... (Instagram, Google, any direct image link)",
            key=f"{state_key}_url_input",
            label_visibility="collapsed",
        )
        if st.button("Load from URL", key=f"{state_key}_url_btn") and url_val:
            with st.spinner("Fetching image..."):
                img = load_image_from_url(url_val)
            if img:
                st.session_state[custom_key] = img
                st.image(thumb(img), width=140)
                st.caption("✓ Loaded — will use this for the slide")
            else:
                st.error("Couldn't load image. Try a direct .jpg or .png link.")

    # ── Resolve which image to return ───────────────────────────────────────
    # Priority: custom upload/URL > selected database photo > first available
    if custom_key in st.session_state:
        return st.session_state[custom_key]

    valid_list = [p for p in photos if p is not None]
    idx = st.session_state.get(db_idx_key, default)
    if valid_list:
        return valid_list[min(idx, len(valid_list) - 1)]
    return None


# ─── AI SUGGESTION UI HELPER ──────────────────────────────────────────────────

def show_ai_suggestions(options: List[str], text_state_key: str, suggest_key: str):
    """
    Display AI-generated copy options as clickable buttons.

    WHY STAGING KEYS?
    Streamlit prohibits modifying a session_state key after the widget that
    owns that key has already been rendered in the current script run.  If we
    wrote st.session_state[text_state_key] = opt directly inside the button
    handler, we'd hit "cannot modify after widget is instantiated" because the
    text_input above was already drawn.

    The fix: write to a *staging* key instead (_stage_<key>), then call
    st.rerun().  On the very next run, the block at the top of each expander
    reads the staging key, moves its value into the real key BEFORE the widget
    is rendered, and deletes the staging key.  The widget then picks up the
    new value cleanly.
    """
    if not options:
        return
    st.caption("✨ AI suggestions — click to apply:")
    for i, opt in enumerate(options):
        if st.button(f'"{opt}"', key=f"{suggest_key}_opt_{i}", use_container_width=True):
            st.session_state[f"_stage_{text_state_key}"] = opt
            st.rerun()


# ─── RENDER SLIDE PREVIEWS + DOWNLOADS ───────────────────────────────────────

def render_slide_downloads(slides: List[tuple], slug: str):
    """Display each generated slide with a download button, then a ZIP download."""
    for filename, img in slides:
        img_bytes = pil_to_bytes(img)
        st.image(img_bytes, use_container_width=True)
        st.download_button(
            f"⬇ {filename}",
            data=img_bytes,
            file_name=f"{slug}_{filename}",
            mime="image/png",
            key=f"dl_{slug}_{filename}",
            use_container_width=True,
        )
        st.divider()

    zip_data = make_zip([(f"{slug}_{fn}", img) for fn, img in slides])
    st.download_button(
        "📦 Download All Slides (ZIP)",
        data=zip_data,
        file_name=f"{slug}_carousel.zip",
        mime="application/zip",
        key=f"zip_{slug}",
        use_container_width=True,
        type="primary",
    )


# ─── HEADER ───────────────────────────────────────────────────────────────────

st.markdown('<div class="brand-header">LOST IN TRANSIT</div>', unsafe_allow_html=True)
st.markdown('<div class="brand-sub">Carousel Creator · Instagram Slide Generator</div>', unsafe_allow_html=True)

# ─── SIDEBAR ──────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("## 🗾 Carousel Creator")

    # AI status indicator
    if ai_enabled:
        st.success("✅ AI copy active")
    else:
        st.warning(
            "⚠️ AI copy not configured\n\n"
            "Add `ANTHROPIC_API_KEY` to your `.env` file to enable AI suggestions."
        )

    # ── Font status ────────────────────────────────────────────────────────
    font_info = get_font_status()
    if font_info["status"] == "inter":
        st.success("✅ Inter font loaded")
    elif font_info["status"] == "system":
        st.warning(f"⚠️ Inter not found — using system font\n\n`{font_info['path']}`")
    else:
        st.error("❌ No usable font found — install Inter fonts")
        st.caption(f"Expected at: `/Users/alexcoluna/lost_in_transit_fonts/`")

    st.divider()

    # ── Text scale slider ───────────────────────────────────────────────────
    st.markdown("**Text Scale**")
    text_scale = st.slider(
        "Adjust all slide text size",
        min_value=0.6,
        max_value=1.5,
        value=st.session_state.get("text_scale", 1.0),
        step=0.05,
        format="%.2fx",
        help="1.0 = default. Drag right to make text bigger, left for smaller.",
        label_visibility="collapsed",
    )
    if text_scale != st.session_state.get("text_scale"):
        st.session_state["text_scale"] = text_scale
        # Reload fonts at new scale and apply globally
        carousel_generator.FONTS = load_fonts(scale=text_scale)
        st.rerun()

    st.divider()

    mode = st.radio(
        "**Carousel Type**",
        options=["Single Store Spotlight", "Multi-Store Roundup", "Neighborhood / DB Suggest"],
        help="Single Store = 5-slide deep dive. Multi-Store = themed roundup. Neighborhood = editorial guide.",
    )

    st.divider()
    st.markdown("**Output specs**")
    st.caption("📐 1080 × 1350px (Portrait)")
    st.caption("🖼 PNG, Instagram-ready")
    st.caption("✨ Inter font, Cyan #00D9FF")

    st.divider()
    st.markdown("**Tips**")
    st.markdown("""
<div class="tip">Hook = 5–8 words max.<br>Punchy and specific, not descriptive.</div>
<div class="tip">Captions = 1–2 short sentences.<br>Think headline, not body copy.</div>
<div class="tip">Each slide has its own photo source —<br>upload your own to override the database.</div>
""", unsafe_allow_html=True)


# ─── LOAD STORE DATABASE ──────────────────────────────────────────────────────

with st.spinner("Connecting to store database..."):
    try:
        all_stores = get_all_stores()
    except Exception as e:
        st.error(f"❌ Could not connect to Supabase: {e}")
        st.stop()

store_lookup = {s["name"]: s for s in all_stores}
store_display_names = [
    f"{s['name']}  ·  {s.get('neighborhood') or s.get('city', '')}"
    for s in all_stores
]
display_to_name = {
    f"{s['name']}  ·  {s.get('neighborhood') or s.get('city', '')}": s["name"]
    for s in all_stores
}


# ══════════════════════════════════════════════════════════════════════════════
# MODE 1 — SINGLE STORE SPOTLIGHT
# ══════════════════════════════════════════════════════════════════════════════

if mode == "Single Store Spotlight":

    st.subheader("Single Store Spotlight")
    st.caption("5 slides — Cover · Info · Detail · Address · CTA")
    st.divider()

    selected_display = st.selectbox(
        "🔍 Search for a store",
        options=[""] + store_display_names,
        index=0,
        placeholder="Type to search...",
    )

    if not selected_display:
        st.info("👆 Select a store above to get started.")
        st.stop()

    store = store_lookup[display_to_name[selected_display]]
    photo_urls = tuple(store.get("photos") or [])

    with st.spinner(f"Loading photos for {store['name']}..."):
        photos = load_photos(photo_urls) if photo_urls else []
    valid_photos = [p for p in photos if p is not None]

    if not valid_photos:
        st.warning("⚠️ No database photos for this store — you can upload your own below.")

    # Store info strip
    c1, c2, c3 = st.columns(3)
    c1.metric("Store", store["name"])
    c2.metric("Location", f"{store.get('neighborhood') or ''} · {store.get('city', '')}")
    c3.metric("Photos in DB", len(valid_photos))
    st.divider()

    # ── Fetch AI suggestions immediately when a store is selected ────────────
    # Cached per store — won't re-call on every rerun for the same store.
    ai_data = {}
    if ai_enabled:
        with st.spinner("✨ Getting AI copy suggestions..."):
            ai_data = ai_suggest_single(
                store_id=str(store.get("id", store["name"])),
                name=store["name"],
                neighborhood=store.get("neighborhood") or "",
                city=store.get("city", ""),
                categories=", ".join(store.get("categories") or []),
                description=store.get("description") or "",
            )
        if ai_data.get("error"):
            # Clear the cache so a bad response doesn't get permanently stuck
            ai_suggest_single.clear()
            st.warning(f"⚠️ AI suggestion error — retrying on next load: {ai_data['error']}")
            ai_data = {}

    # ── Clear stale session state when store changes ───────────────────────
    # If the user picks a different store, wipe the old hook/caption values
    # so they don't bleed into the new store's text fields.
    prev_store = st.session_state.get("_current_store")
    if prev_store != store["name"]:
        for key in ["s1_hook", "s2_cap", "s3_cap", "slides_single", "slug_single"]:
            if key in st.session_state:
                del st.session_state[key]
        st.session_state["_current_store"] = store["name"]

    # ── Description sentence fallbacks ───────────────────────────────────────
    desc  = store.get("description", "")
    sents = [s.strip() for s in desc.split(".") if len(s.strip()) > 15]
    info_default   = _trim_to_words(sents[1], 72).lower() if len(sents) > 1 else make_one_liner(store)
    detail_default = _trim_to_words(sents[2], 72).lower() if len(sents) > 2 else make_one_liner(store)

    # ── Auto-populate text fields with first AI suggestion ────────────────────
    # Only sets the value if not already set (won't override manual edits).
    if ai_data.get("hooks") and "s1_hook" not in st.session_state:
        st.session_state["s1_hook"] = ai_data["hooks"][0]
    if ai_data.get("info_captions") and "s2_cap" not in st.session_state:
        st.session_state["s2_cap"] = ai_data["info_captions"][0]
    if ai_data.get("detail_captions") and "s3_cap" not in st.session_state:
        st.session_state["s3_cap"] = ai_data["detail_captions"][0]

    # ── Filmstrip / active-slide state (must run before both columns) ─────────
    # Reset to slide 0 whenever the user picks a new store.
    if st.session_state.get("_filmstrip_store") != store["name"]:
        st.session_state["active_slide"]     = 0
        st.session_state["_filmstrip_store"] = store["name"]
        if "filmstrip_slides" in st.session_state:
            del st.session_state["filmstrip_slides"]

    active = st.session_state.get("active_slide", 0)
    SLIDE_LABELS = ["1 · Cover", "2 · Info", "3 · Detail", "4 · Address", "5 · CTA"]

    # ── Silent photo resolver ─────────────────────────────────────────────────
    # Reads session_state without rendering any widgets. Used for the slides
    # that are NOT currently active so build_all_slides() always has all images.
    def resolve_photo(photos, key, default=0):
        custom = st.session_state.get(f"{key}_custom")
        if custom:
            return custom
        valid = [p for p in photos if p is not None]
        idx   = st.session_state.get(f"{key}_db_idx", default)
        return valid[min(idx, len(valid) - 1)] if valid else None

    _d = {
        "cover":  0,
        "info":   min(1, len(valid_photos) - 1) if valid_photos else 0,
        "detail": min(2, len(valid_photos) - 1) if valid_photos else 0,
        "addr":   min(3, len(valid_photos) - 1) if valid_photos else 0,
    }
    cover_img  = resolve_photo(valid_photos, "cover",  _d["cover"])
    info_img   = resolve_photo(valid_photos, "info",   _d["info"])
    detail_img = resolve_photo(valid_photos, "detail", _d["detail"])
    addr_img   = resolve_photo(valid_photos, "addr",   _d["addr"])

    # Pre-resolve text (keeps inactive slides' canvas layers up to date)
    hook = st.session_state.get("s1_hook", make_hook_line(store))
    cap2 = st.session_state.get("s2_cap",  info_default)
    cap3 = st.session_state.get("s3_cap",  detail_default)

    left, right = st.columns([1, 1], gap="large")

    with left:
        # Header synced with the active filmstrip slide
        st.markdown(f"### ✏️ {SLIDE_LABELS[active]}")
        st.caption("← Click any filmstrip thumbnail to switch slides")
        st.divider()

        if active == 0:
            # ── Slide 1: Cover ────────────────────────────────────────────────
            if "_stage_s1_hook" in st.session_state:
                st.session_state["s1_hook"] = st.session_state.pop("_stage_s1_hook")
            hook = st.text_input(
                "Hook line",
                value=st.session_state.get("s1_hook", make_hook_line(store)),
                help="Short and punchy — 5 to 8 words. Appears large on the cover slide.",
                key="s1_hook",
            )
            st.caption(
                f"{'⚠️ Too long — ' if len(hook) > 52 else '✓ '}{len(hook)} chars (aim for under 52)"
            )
            if ai_data.get("hooks"):
                show_ai_suggestions(ai_data["hooks"][1:], "s1_hook", "s1_hook_sug")
            st.divider()
            cover_img = photo_picker_with_upload(valid_photos, "Cover photo", "cover")

        elif active == 1:
            # ── Slide 2: Info ─────────────────────────────────────────────────
            if "_stage_s2_cap" in st.session_state:
                st.session_state["s2_cap"] = st.session_state.pop("_stage_s2_cap")
            cap2 = st.text_area(
                "Caption",
                value=st.session_state.get("s2_cap", info_default),
                height=110,
                help="1–2 sentences. The vibe, history, or what makes it unique.",
                key="s2_cap",
            )
            st.caption(f"{len(cap2)} chars")
            if ai_data.get("info_captions"):
                show_ai_suggestions(ai_data["info_captions"][1:], "s2_cap", "s2_sug")
            st.divider()
            info_img = photo_picker_with_upload(
                valid_photos, "Slide 2 photo", "info", default=_d["info"],
            )

        elif active == 2:
            # ── Slide 3: Detail ───────────────────────────────────────────────
            if "_stage_s3_cap" in st.session_state:
                st.session_state["s3_cap"] = st.session_state.pop("_stage_s3_cap")
            cap3 = st.text_area(
                "Caption",
                value=st.session_state.get("s3_cap", detail_default),
                height=110,
                help="A different angle — what to expect, what to look for, price range.",
                key="s3_cap",
            )
            st.caption(f"{len(cap3)} chars")
            if ai_data.get("detail_captions"):
                show_ai_suggestions(ai_data["detail_captions"][1:], "s3_cap", "s3_sug")
            st.divider()
            detail_img = photo_picker_with_upload(
                valid_photos, "Slide 3 photo", "detail", default=_d["detail"],
            )

        elif active == 3:
            # ── Slide 4: Address ──────────────────────────────────────────────
            st.caption("Address and hours are pulled from the database automatically.")
            addr  = store.get("address", "No address on file")
            hours = store.get("hours", "")
            ig    = store.get("instagram", "")
            st.text(f"📍 {addr}")
            if hours:
                st.text(f"🕐 {hours.split(chr(10))[0]}...")
            if ig:
                st.text(f"📷 {ig}")
            st.divider()
            addr_img = photo_picker_with_upload(
                valid_photos, "Address slide photo", "addr", default=_d["addr"],
            )

        elif active == 4:
            # ── Slide 5: CTA ──────────────────────────────────────────────────
            st.caption("Auto-generated Lost in Transit end card — no edits needed.")
            st.markdown("**@lostintransit.japan**")
            st.markdown("lostintransitjp.com")
            st.markdown("*save this post · follow for more Japan finds*")

        # ── DESIGN ELEMENTS ───────────────────────────────────────────────────
        with st.expander("🎨 Design Elements", expanded=False):
            st.caption(
                "Global design controls applied to all slides. "
                "After making changes, hit **🔄 Refresh** in the filmstrip."
            )

            # ── Category badge ─────────────────────────────────────────────
            st.markdown("**Category badge**")
            badge_col1, badge_col2 = st.columns([1, 2])
            with badge_col1:
                de_show_badge = st.toggle(
                    "Show badge",
                    value=st.session_state.get("de_show_badge", True),
                    key="de_show_badge",
                    help="Colored circle with category abbreviation at the bottom-right corner",
                )
            with badge_col2:
                auto_cat_label = (
                    CATEGORY_CONFIG[get_category_key(store.get("categories") or [])]["label"]
                    if get_category_key(store.get("categories") or [])
                    else "None detected"
                )
                cat_options = ["Auto-detect"] + [v["label"] for v in CATEGORY_CONFIG.values()]
                de_cat_override = st.selectbox(
                    "Category override",
                    options=cat_options,
                    index=st.session_state.get("de_cat_override_idx", 0),
                    key="de_cat_override",
                    disabled=not de_show_badge,
                    help=f"Auto-detect uses: {auto_cat_label}",
                    label_visibility="collapsed",
                )
                # Persist override index so it survives reruns
                st.session_state["de_cat_override_idx"] = cat_options.index(de_cat_override)

            if de_show_badge:
                # Resolved badge category: override takes precedence over auto
                if de_cat_override != "Auto-detect":
                    _override_key = next(
                        (k for k, v in CATEGORY_CONFIG.items() if v["label"] == de_cat_override),
                        None,
                    )
                    st.session_state["de_resolved_cat_key"] = _override_key
                else:
                    st.session_state["de_resolved_cat_key"] = get_category_key(store.get("categories") or [])
            else:
                st.session_state["de_resolved_cat_key"] = None

            # Show the resolved category as a small swatch
            resolved_k = st.session_state.get("de_resolved_cat_key")
            if resolved_k:
                cfg = CATEGORY_CONFIG[resolved_k]
                r, g, b = cfg["rgb"]
                st.markdown(
                    f'<div style="display:inline-flex;align-items:center;gap:8px;">'
                    f'<span style="width:14px;height:14px;border-radius:50%;'
                    f'background:rgb({r},{g},{b});display:inline-block;"></span>'
                    f'<span style="font-size:0.82rem;color:#9ca3af;">'
                    f'{cfg["label"]} — <code style="font-size:0.78rem;">{cfg["hex"]}</code>'
                    f'</span></div>',
                    unsafe_allow_html=True,
                )

            st.divider()

            # ── Corner brackets ────────────────────────────────────────────
            st.markdown("**Corner brackets**")
            de_show_brackets = st.toggle(
                "Show corner brackets",
                value=st.session_state.get("de_show_brackets", True),
                key="de_show_brackets",
                help="The signature white LIT corner bracket marks on each slide",
            )

    # ── RIGHT COLUMN: Filmstrip + Canvas Editor ──────────────────────────────
    with right:

        # ── Shared computed values used across canvas layers ─────────────────
        slug         = store["name"].lower().replace(" ", "_").replace("/", "_")[:25]
        store_name   = store.get("name", "")
        # cat_key and brackets come from Design Elements panel (or defaults)
        cat_key         = st.session_state.get(
            "de_resolved_cat_key",
            get_category_key(store.get("categories") or []),
        )
        show_brackets   = st.session_state.get("de_show_brackets", True)
        location_str = (
            f"{store.get('city', '')} · {store.get('neighborhood', '')}"
            if store.get("neighborhood")
            else store.get("city", "")
        ).upper()

        if len(store_name) > 22:
            name_font_sz = 66
        elif len(store_name) > 14:
            name_font_sz = 86
        else:
            name_font_sz = 108

        cover_loc_y  = H - 100
        cover_name_y = cover_loc_y - (86 if name_font_sz == 66 else 108 if name_font_sz == 86 else 132)
        info_loc_y   = H - 90
        info_name_y  = info_loc_y - (86 if name_font_sz == 66 else 108 if name_font_sz == 86 else 132)

        # ── Helper: build all 5 full-res PIL slides ───────────────────────────
        # Used for filmstrip thumbnails and for the final ZIP export.
        def build_all_slides():
            return [
                ("01_cover.png",   slide_single_cover(store, cover_img, hook, 5,
                                       category_key=cat_key, with_brackets=show_brackets)),
                ("02_info.png",    slide_single_info(store, info_img, cap2, 2, 5,
                                       category_key=cat_key, with_brackets=show_brackets)),
                ("03_detail.png",  slide_single_info(store, detail_img, cap3, 3, 5,
                                       category_key=cat_key, with_brackets=show_brackets)),
                ("04_address.png", slide_address(store, addr_img, 4, 5)),
                ("05_cta.png",     slide_cta()),
            ]

        # active, SLIDE_LABELS are already computed before the columns split.

        # ── Filmstrip header row ──────────────────────────────────────────────
        hdr_left, hdr_right = st.columns([3, 1])
        with hdr_left:
            st.markdown("### 🎞 Filmstrip")
            st.caption("Click any slide below to edit it. Refresh to update thumbnails after changes.")
        with hdr_right:
            refresh_btn = st.button(
                "🔄 Refresh",
                key="refresh_filmstrip",
                use_container_width=True,
                help="Re-render all thumbnails with your latest text + photos",
            )

        # Auto-render thumbnails on first store load, or on refresh click
        needs_render = (
            "filmstrip_slides" not in st.session_state
            or refresh_btn
        )
        if needs_render:
            with st.spinner("Rendering slide previews…"):
                st.session_state["filmstrip_slides"] = build_all_slides()

        # ── Draw the filmstrip row ────────────────────────────────────────────
        film_cols = st.columns(5, gap="small")
        for i, (col, label) in enumerate(zip(film_cols, SLIDE_LABELS)):
            _, slide_img = st.session_state["filmstrip_slides"][i]
            # Resize to a small thumbnail (108×135 keeps the 4:5 ratio)
            thumb_bytes = pil_to_bytes(slide_img.resize((108, 135), Image.LANCZOS))
            is_active   = (i == active)

            with col:
                col.image(thumb_bytes, use_container_width=True)
                btn_label = f"✓ {label}" if is_active else label
                if col.button(btn_label, key=f"film_{i}", use_container_width=True):
                    st.session_state["active_slide"] = i
                    st.rerun()

        st.divider()

        # ── Active slide label + Prev / Next navigation ───────────────────────
        nav_l, nav_mid, nav_r = st.columns([1, 3, 1])
        with nav_l:
            if active > 0:
                if st.button("← Prev", key="nav_prev", use_container_width=True):
                    st.session_state["active_slide"] = active - 1
                    st.rerun()
        with nav_mid:
            st.markdown(
                f'<div style="text-align:center;">'
                f'<span class="slide-label">Editing: {SLIDE_LABELS[active]}</span>'
                f'</div>',
                unsafe_allow_html=True,
            )
        with nav_r:
            if active < 4:
                if st.button("Next →", key="nav_next", use_container_width=True):
                    st.session_state["active_slide"] = active + 1
                    st.rerun()

        # ── Canvas editor / static preview for active slide ───────────────────

        if active == 0:
            # Slide 1 — Cover (editable canvas)
            st.caption("Click text to select · drag to reposition · double-click to edit · ⬇ Save PNG")
            bg_cover = get_slide_background(
                cover_img, gradient="cover",
                with_brackets=show_brackets, resize_to=(648, 810),
            )
            cover_layers = [
                {"id": "brand",      "text": "LOST IN TRANSIT",
                 "x": 62, "y": 58,  "fontSize": 44, "fill": "#00D9FF", "fontWeight": "bold"},
                {"id": "hook",       "text": clean_render_text(hook).lower(),
                 "x": 62, "y": int(H * 0.33), "fontSize": 112, "fill": "#ffffff",
                 "fontWeight": "900", "maxWidth": W - 124},
                {"id": "store_name", "text": store_name,
                 "x": 62, "y": cover_name_y, "fontSize": name_font_sz,
                 "fill": "#ffffff", "fontWeight": "800"},
                {"id": "location",   "text": location_str,
                 "x": 62, "y": cover_loc_y, "fontSize": 46, "fill": "#00D9FF", "fontWeight": "bold"},
            ]
            render_canvas_editor(bg_cover, cover_layers, f"{slug}_01_cover.png")

        elif active == 1:
            # Slide 2 — Info (editable canvas)
            st.caption("Click text to select · drag to reposition · double-click to edit · ⬇ Save PNG")
            bg_info = get_slide_background(
                info_img, gradient="heavy",
                with_brackets=show_brackets, resize_to=(648, 810),
            )
            info_layers = [
                {"id": "caption",    "text": clean_render_text(cap2).lower(),
                 "x": 62, "y": 560, "fontSize": 52, "fill": "#ffffff",
                 "fontWeight": "bold", "maxWidth": W - 124},
                {"id": "store_name", "text": store_name,
                 "x": 62, "y": info_name_y, "fontSize": name_font_sz,
                 "fill": "#ffffff", "fontWeight": "800"},
                {"id": "location",   "text": location_str,
                 "x": 62, "y": info_loc_y, "fontSize": 36, "fill": "#00D9FF", "fontWeight": "bold"},
            ]
            render_canvas_editor(bg_info, info_layers, f"{slug}_02_info.png")

        elif active == 2:
            # Slide 3 — Detail (editable canvas)
            st.caption("Click text to select · drag to reposition · double-click to edit · ⬇ Save PNG")
            bg_detail = get_slide_background(
                detail_img, gradient="heavy",
                with_brackets=show_brackets, resize_to=(648, 810),
            )
            detail_layers = [
                {"id": "caption",    "text": clean_render_text(cap3).lower(),
                 "x": 62, "y": 560, "fontSize": 52, "fill": "#ffffff",
                 "fontWeight": "bold", "maxWidth": W - 124},
                {"id": "store_name", "text": store_name,
                 "x": 62, "y": info_name_y, "fontSize": name_font_sz,
                 "fill": "#ffffff", "fontWeight": "800"},
                {"id": "location",   "text": location_str,
                 "x": 62, "y": info_loc_y, "fontSize": 36, "fill": "#00D9FF", "fontWeight": "bold"},
            ]
            render_canvas_editor(bg_detail, detail_layers, f"{slug}_03_detail.png")

        elif active == 3:
            # Slide 4 — Address (static preview)
            st.caption("Auto-filled from database — no editing needed")
            _, addr_slide_img = st.session_state["filmstrip_slides"][3]
            img_bytes_addr = pil_to_bytes(addr_slide_img)
            st.image(img_bytes_addr, use_container_width=True)
            st.download_button(
                "⬇ Download Address Slide",
                data=img_bytes_addr,
                file_name=f"{slug}_04_address.png",
                mime="image/png",
                key="dl_addr_single",
                use_container_width=True,
            )

        elif active == 4:
            # Slide 5 — CTA (static preview)
            st.caption("Auto-generated Lost in Transit end card")
            _, cta_slide_img = st.session_state["filmstrip_slides"][4]
            img_bytes_cta = pil_to_bytes(cta_slide_img)
            st.image(img_bytes_cta, use_container_width=True)
            st.download_button(
                "⬇ Download CTA Slide",
                data=img_bytes_cta,
                file_name=f"{slug}_05_cta.png",
                mime="image/png",
                key="dl_cta_single",
                use_container_width=True,
            )

        st.divider()

        # ── Export: download all 5 slides as ZIP ─────────────────────────────
        # filmstrip_slides are already rendered — just pack and offer download.
        st.markdown("**📦 Download Full Carousel**")
        st.caption("All 5 slides at full 1080×1350px quality, packaged in a ZIP.")
        zip_data = make_zip(st.session_state["filmstrip_slides"])
        st.download_button(
            "⬇ Download All Slides (ZIP)",
            data=zip_data,
            file_name=f"{slug}_carousel.zip",
            mime="application/zip",
            key="zip_single_save",
            use_container_width=True,
            type="primary",
        )


# ══════════════════════════════════════════════════════════════════════════════
# MODE 2 — MULTI-STORE ROUNDUP
# ══════════════════════════════════════════════════════════════════════════════

elif mode == "Multi-Store Roundup":

    st.subheader("Multi-Store Roundup")
    st.caption("Cover + one slide per store + CTA — build a themed carousel")
    st.divider()

    meta_col1, meta_col2 = st.columns(2)
    with meta_col1:
        title = st.text_input(
            "Carousel title / theme",
            placeholder="e.g. 5 archive stores in Harajuku",
            key="multi_title_input",
        )
    with meta_col2:
        subtitle = st.text_input(
            "Subtitle / location",
            placeholder="e.g. Tokyo, Japan",
            key="multi_subtitle_input",
        )

    st.divider()
    st.markdown("### 🏪 Add Stores")

    if "multi_stores" not in st.session_state:
        st.session_state["multi_stores"] = []
    if "multi_captions" not in st.session_state:
        st.session_state["multi_captions"] = {}

    add_col, _ = st.columns([2, 1])
    with add_col:
        existing_names = [s["name"] for s in st.session_state["multi_stores"]]
        add_display = st.selectbox(
            "Add a store",
            options=[""] + [d for d in store_display_names if display_to_name[d] not in existing_names],
            index=0,
            key="multi_add_select",
        )

    if st.button("➕ Add to carousel", key="multi_add_btn") and add_display:
        store_to_add = store_lookup[display_to_name[add_display]]
        if len(st.session_state["multi_stores"]) >= 8:
            st.warning("Max 8 stores per carousel.")
        else:
            st.session_state["multi_stores"].append(store_to_add)
            st.rerun()

    if not st.session_state["multi_stores"]:
        st.info("Add stores above to build your carousel.")

    else:
        # ── AI one-liners — fires when title is set and stores are added ────
        ai_multi = {}
        if ai_enabled and title:
            stores_for_ai = [
                {
                    "name": s["name"],
                    "neighborhood": s.get("neighborhood") or s.get("city", ""),
                    "city": s.get("city", ""),
                    "categories": ", ".join(s.get("categories") or []),
                    "description": (s.get("description") or "")[:120],
                }
                for s in st.session_state["multi_stores"]
            ]
            with st.spinner("✨ Getting AI one-liners..."):
                ai_multi = ai_suggest_multi(title, json.dumps(stores_for_ai))

        st.markdown(f"**{len(st.session_state['multi_stores'])} stores added** (max 8)")

        to_remove = []
        for i, s in enumerate(st.session_state["multi_stores"]):
            with st.expander(
                f"**{i+1}. {s['name']}** — {s.get('neighborhood') or s.get('city', '')}",
                expanded=(i == 0),
            ):
                # Resolve default caption: user edit > AI suggestion > fallback
                cap_key = f"multi_cap_{s['name']}"
                ai_liner = ai_multi.get("one_liners", {}).get(s["name"])
                default_liner = (
                    st.session_state["multi_captions"].get(s["name"])
                    or ai_liner
                    or make_one_liner(s)
                )

                caption = st.text_area(
                    "One-liner caption",
                    value=default_liner,
                    height=70,
                    key=cap_key,
                )
                st.session_state["multi_captions"][s["name"]] = caption

                if ai_liner and ai_liner != caption:
                    st.caption(f'✨ AI: *"{ai_liner}"*')
                    if st.button("Use AI version", key=f"multi_ai_{s['name']}"):
                        st.session_state["multi_captions"][s["name"]] = ai_liner
                        st.rerun()

                # Photo picker
                s_urls = tuple(s.get("photos") or [])
                if s_urls:
                    s_photos = load_photos(s_urls)
                    s_valid = [p for p in s_photos if p is not None]
                    if s_valid:
                        photo_picker_with_upload(s_valid, "Store photo", f"multi_photo_{s['name']}", default=0)

                if st.button(f"✕ Remove {s['name']}", key=f"remove_{s['name']}"):
                    to_remove.append(i)

        for idx in sorted(to_remove, reverse=True):
            st.session_state["multi_stores"].pop(idx)
        if to_remove:
            st.rerun()

        st.divider()
        left_m, right_m = st.columns([1, 1], gap="large")

        with left_m:
            can_generate = bool(title) and len(st.session_state["multi_stores"]) >= 2
            gen_multi = st.button(
                "🎨  Generate Carousel",
                type="primary",
                use_container_width=True,
                key="gen_multi",
                disabled=not can_generate,
            )
            if not title:
                st.caption("⚠️ Add a carousel title to generate")
            elif len(st.session_state["multi_stores"]) < 2:
                st.caption("⚠️ Add at least 2 stores")

        with right_m:
            if gen_multi:
                stores_list = st.session_state["multi_stores"]
                total = len(stores_list) + 2

                with st.spinner("Generating slides..."):
                    slides = []

                    # Cover photo — use first store's selected photo
                    first = stores_list[0]
                    first_photos = load_photos(tuple(first.get("photos") or []))
                    first_valid = [p for p in first_photos if p is not None]
                    cover_photo = (
                        st.session_state.get(f"multi_photo_{first['name']}_custom")
                        or (first_valid[st.session_state.get(f"multi_photo_{first['name']}_db_idx", 0)]
                            if first_valid else None)
                    )

                    slides.append(("00_cover.png", slide_multi_cover(title, subtitle, cover_photo, len(stores_list))))

                    for i, s in enumerate(stores_list, 1):
                        s_photos = load_photos(tuple(s.get("photos") or []))
                        s_valid = [p for p in s_photos if p is not None]
                        photo = (
                            st.session_state.get(f"multi_photo_{s['name']}_custom")
                            or (s_valid[st.session_state.get(f"multi_photo_{s['name']}_db_idx", 0)]
                                if s_valid else None)
                        )
                        liner = st.session_state["multi_captions"].get(s["name"]) or make_one_liner(s)
                        slug_s = s["name"].lower().replace(" ", "_")[:15]
                        slides.append((f"{i:02d}_{slug_s}.png", slide_multi_store(s, photo, i + 1, total, liner)))

                    slides.append((f"{len(stores_list)+1:02d}_cta.png", slide_cta()))
                    st.session_state["slides_multi"] = slides
                    st.session_state["slug_multi"] = title.lower().replace(" ", "_")[:30]
                    st.success(f"✅ {len(slides)} slides generated")

            if "slides_multi" in st.session_state:
                render_slide_downloads(
                    st.session_state["slides_multi"],
                    st.session_state["slug_multi"],
                )


# ══════════════════════════════════════════════════════════════════════════════
# MODE 3 — NEIGHBORHOOD / DB SUGGEST
# ══════════════════════════════════════════════════════════════════════════════

elif mode == "Neighborhood / DB Suggest":

    st.subheader("Neighborhood Guide")
    st.caption("Filter your database, get AI editorial copy, and generate a neighborhood carousel")
    st.divider()

    f1, f2, f3, f4 = st.columns(4)
    with f1:
        city_input = st.text_input("City", placeholder="Tokyo, Osaka...")
    with f2:
        neighborhood_input = st.text_input("Neighborhood", placeholder="Harajuku, Shimokitazawa...")
    with f3:
        category_input = st.text_input("Category", placeholder="vintage, coffee...")
    with f4:
        count = st.slider("Number of stores", min_value=2, max_value=8, value=5)

    if st.button("🔍 Find Stores", key="db_search"):
        try:
            sb = get_supabase()
            q = sb.table("stores").select(
                "id, name, address, neighborhood, city, google_place_id, description, categories, hours, instagram, photos"
            )
            if city_input:
                q = q.ilike("city", f"%{city_input}%")
            if neighborhood_input:
                q = q.ilike("neighborhood", f"%{neighborhood_input}%")
            if category_input:
                q = q.contains("categories", [category_input])
            res = q.limit(count * 3).execute()
            found = [s for s in res.data if s.get("photos") and len(s["photos"]) > 0][:count]
            st.session_state["suggest_stores"] = found
            # Reset AI data when filters change
            for k in ["suggest_ai", "slides_suggest"]:
                if k in st.session_state:
                    del st.session_state[k]
        except Exception as e:
            st.error(f"Search failed: {e}")

    if "suggest_stores" in st.session_state:
        found = st.session_state["suggest_stores"]

        if not found:
            st.warning("No stores found. Try broadening your search.")
        else:
            st.success(f"✅ Found {len(found)} stores")

            suggest_title = st.text_input(
                "Carousel title",
                placeholder="e.g. A day in Shimokitazawa",
                key="suggest_title",
            )
            suggest_subtitle = st.text_input(
                "Subtitle",
                placeholder="e.g. Tokyo, Japan",
                key="suggest_subtitle",
            )

            # ── AI neighborhood editorial copy ───────────────────────────────
            ai_nbhd = {}
            if ai_enabled and neighborhood_input:
                stores_for_ai = [{"name": s["name"]} for s in found]
                with st.spinner("✨ Generating neighborhood editorial copy..."):
                    ai_nbhd = ai_suggest_neighborhood(
                        neighborhood=neighborhood_input,
                        city=city_input or "",
                        stores_json=json.dumps(stores_for_ai),
                    )

                if ai_nbhd.get("hook") or ai_nbhd.get("editorial"):
                    st.divider()
                    st.markdown("**✨ AI Neighborhood Copy**")

                    if ai_nbhd.get("hook"):
                        st.markdown(f'**Cover hook:** *"{ai_nbhd["hook"]}"*')
                        if st.button("Use as carousel title", key="use_ai_hook"):
                            st.session_state["suggest_title"] = ai_nbhd["hook"]
                            st.rerun()

                    if ai_nbhd.get("editorial"):
                        st.markdown(f'**Editorial intro:** {ai_nbhd["editorial"]}')
                        st.caption("Use this in your Instagram caption alongside the post.")

            st.divider()
            st.markdown("**Stores in this carousel:**")
            for s in found:
                ai_liner = ai_nbhd.get("one_liners", {}).get(s["name"], "")
                liner_note = f' — *"{ai_liner}"*' if ai_liner else ""
                st.markdown(
                    f"• **{s['name']}** — {s.get('neighborhood') or ''}, {s.get('city', '')}{liner_note}"
                )

            st.divider()
            if st.button(
                "🎨 Generate Carousel",
                type="primary",
                key="gen_suggest",
                disabled=not suggest_title,
            ):
                stores_list = found
                total = len(stores_list) + 2

                with st.spinner("Generating..."):
                    slides = []

                    first_photos = load_photos(tuple(found[0].get("photos") or []))
                    first_valid = [p for p in first_photos if p is not None]
                    cover_photo = first_valid[0] if first_valid else None

                    slides.append(("00_cover.png", slide_multi_cover(
                        suggest_title, suggest_subtitle, cover_photo, len(stores_list)
                    )))

                    for i, s in enumerate(stores_list, 1):
                        s_photos = load_photos(tuple(s.get("photos") or []))
                        s_valid = [p for p in s_photos if p is not None]
                        photo = s_valid[0] if s_valid else None
                        liner = ai_nbhd.get("one_liners", {}).get(s["name"]) or make_one_liner(s)
                        slug_s = s["name"].lower().replace(" ", "_")[:15]
                        slides.append((f"{i:02d}_{slug_s}.png", slide_multi_store(s, photo, i + 1, total, liner)))

                    slides.append((f"{len(stores_list)+1:02d}_cta.png", slide_cta()))
                    st.session_state["slides_suggest"] = slides
                    st.session_state["slug_suggest"] = suggest_title.lower().replace(" ", "_")[:30]

            if "slides_suggest" in st.session_state:
                st.divider()
                render_slide_downloads(
                    st.session_state["slides_suggest"],
                    st.session_state["slug_suggest"],
                )
