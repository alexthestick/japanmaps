"""
canvas_editor.py — Fabric.js WYSIWYG canvas editor for Streamlit.

Renders a self-contained HTML component (via st.components.v1.html) that
gives Alex a live, interactive preview of any carousel slide.

Features
--------
  · Click text to select it (selection box + resize handles appear)
  · Drag to reposition anywhere on canvas
  · Resize via corner handles (scale converts to fontSize on mouse-up)
  · Double-click to edit text inline
  · Toolbar: font size ± | White / Cyan / Gray color | Reset all | Hide | Save PNG
  · Arrow keys: 2px nudge (Shift+Arrow = 10px)
  · +/= / -/_ keyboard shortcuts for font size
  · Export PNG at 2× resolution (540×675 → 1080×1350) via browser download

Usage
-----
    from canvas_editor import render_canvas_editor
    from carousel_generator import get_slide_background

    bg = get_slide_background(photo, gradient="cover", resize_to=(540, 675))
    layers = [
        {"id": "hook", "text": "shop name here", "x": 62, "y": 445,
         "fontSize": 112, "fill": "#ffffff", "fontWeight": "900", "maxWidth": 956},
        ...
    ]
    render_canvas_editor(bg, layers, export_filename="cover.png")

Text layer dict keys
--------------------
  id          str   Unique name shown in the status bar
  text        str   Initial text content
  x           int   Left position in PIL space (0–1080)
  y           int   Top position in PIL space (0–1350)
  fontSize    int   Font size in PIL space (will be scaled to display)
  fill        str   CSS color string, e.g. '#ffffff' or '#00D9FF'
  fontWeight  str   '900' | '800' | 'bold' | 'normal'
  maxWidth    int   (optional) Word-wrap max width in PIL space.
                    Defaults to canvas width minus x offset.
"""

import io
import base64
import json
from typing import Any, Dict, List, Optional
from PIL import Image
import streamlit.components.v1 as components

# ── Constants ──────────────────────────────────────────────────────────────────

PIL_W      = 1080
PIL_H      = 1350
DISPLAY_W  = 648    # canvas display width  (px)  — 60 % of 1080
DISPLAY_H  = 810    # canvas display height (px)  — 60 % of 1350


# ── Public API ─────────────────────────────────────────────────────────────────

def img_to_b64(img: Image.Image) -> str:
    """Encode a PIL image as a base64 PNG string (for embedding in HTML)."""
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def render_canvas_editor(
    background: Image.Image,
    text_layers: List[Dict[str, Any]],
    export_filename: str = "slide.png",
) -> None:
    """
    Render an interactive Fabric.js canvas editor embedded in Streamlit.

    All coordinates / font sizes in text_layers are in PIL space (1080×1350).
    The canvas scales everything by DISPLAY_W / PIL_W = 0.5 automatically.
    The "Save PNG" button exports at multiplier=2, giving a 1080×1350 PNG.

    Parameters
    ----------
    background      : PIL Image — photo + gradient + corner brackets, NO text.
                      Should be pre-resized to (DISPLAY_W, DISPLAY_H) = 540×675
                      for fast base64 encoding; the canvas stretches it to fit.
    text_layers     : list of dicts (see module docstring for keys)
    export_filename : browser download filename for the "Save PNG" button
    """
    bg_b64       = img_to_b64(background)
    layers_json  = json.dumps(text_layers, ensure_ascii=True)
    scale        = round(DISPLAY_W / PIL_W, 6)

    html = (
        _HTML_TEMPLATE
        .replace("__BG_B64__",      bg_b64)
        .replace("__LAYERS_JSON__", layers_json)
        .replace("__CW__",          str(DISPLAY_W))
        .replace("__CH__",          str(DISPLAY_H))
        .replace("__SC__",          str(scale))
        .replace("__FN__",          export_filename.replace('"', ''))
    )

    # Height = canvas + toolbar (~42px) + status bar (~26px) + padding
    components.html(html, height=DISPLAY_H + 90, scrolling=False)


# ── HTML Template ──────────────────────────────────────────────────────────────
# Placeholders replaced at render time:
#   __BG_B64__       base64-encoded PNG background
#   __LAYERS_JSON__  JSON array of text layer configs
#   __CW__           canvas display width  (540)
#   __CH__           canvas display height (675)
#   __SC__           scale factor          (0.5)
#   __FN__           export filename

_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0b0f19;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── Toolbar ─────────────────────────────────────────────── */
  #toolbar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    background: #111827;
    border: 1px solid #1e2d42;
    border-radius: 7px 7px 0 0;
    flex-wrap: wrap;
    min-height: 38px;
  }
  .tg {
    display: flex;
    align-items: center;
    gap: 3px;
    padding-right: 7px;
    border-right: 1px solid #1e2d42;
  }
  .tg:last-child { border-right: none; padding-right: 0; }
  .tl {
    color: #4b5563;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .hint {
    color: #374151;
    font-size: 9px;
    font-style: italic;
    flex: 1;
    text-align: right;
    white-space: nowrap;
  }

  /* ── Buttons ──────────────────────────────────────────────── */
  button {
    background: #1e293b;
    color: #d1d5db;
    border: 1px solid #334155;
    border-radius: 4px;
    padding: 0 9px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    height: 24px;
    white-space: nowrap;
    line-height: 1;
    transition: background 0.1s, color 0.1s;
  }
  button:hover                 { background: #334155; color: #fff; }
  button.active                { background: #00D9FF !important; color: #0b0f19 !important; border-color: #00D9FF !important; }
  button.primary               { background: #00D9FF; color: #0b0f19; border-color: #00D9FF; font-weight: 700; }
  button.primary:hover         { background: #00b8d9; }
  button.danger                { color: #f87171; }
  button.danger:hover          { background: #450a0a; color: #fca5a5; border-color: #f87171; }
  button:disabled              { opacity: 0.3; cursor: not-allowed; }

  .fsdisp {
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
    min-width: 42px;
    text-align: center;
  }

  /* ── Canvas wrapper ───────────────────────────────────────── */
  #cwrap {
    position: relative;
    border: 1px solid #1e2d42;
    border-top: none;
    overflow: hidden;
    line-height: 0;
  }

  /* ── Status bar ───────────────────────────────────────────── */
  #statusbar {
    background: #111827;
    border: 1px solid #1e2d42;
    border-top: none;
    border-radius: 0 0 7px 7px;
    padding: 3px 10px;
    font-size: 9px;
    color: #4b5563;
    min-height: 22px;
    display: flex;
    align-items: center;
  }
  #statusbar.on { color: #00D9FF; }
</style>
</head>
<body>

<!-- ── Toolbar ──────────────────────────────────────────────── -->
<div id="toolbar">

  <div class="tg">
    <span class="tl">Size</span>
    <button id="btn-minus" onclick="cfs(-4)" disabled>−</button>
    <span class="fsdisp" id="fsdisp">—</span>
    <button id="btn-plus"  onclick="cfs(4)"  disabled>+</button>
  </div>

  <div class="tg">
    <span class="tl">Color</span>
    <button id="btn-white" onclick="sc('#ffffff')" disabled>White</button>
    <button id="btn-cyan"  onclick="sc('#00D9FF')" disabled>Cyan</button>
    <button id="btn-gray"  onclick="sc('#9ca3af')" disabled>Gray</button>
  </div>

  <div class="tg">
    <span class="tl">Edit</span>
    <button onclick="ra()">↺ Reset</button>
    <button id="btn-hide" class="danger" onclick="hs()" disabled>✕ Hide</button>
  </div>

  <div class="tg">
    <button class="primary" onclick="ex()">⬇ Save PNG</button>
  </div>

  <span class="hint">Click · Drag · Dbl-click to edit · ⌨ ±size · Arrows nudge</span>
</div>

<!-- ── Canvas ───────────────────────────────────────────────── -->
<div id="cwrap">
  <canvas id="c"></canvas>
</div>

<!-- ── Status bar ───────────────────────────────────────────── -->
<div id="statusbar">Click any text element to select it</div>

<!-- Fabric.js from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
<script>
// ── Config ──────────────────────────────────────────────────────────────────
const CW     = __CW__;
const CH     = __CH__;
const SC     = __SC__;
const FN     = "__FN__";
const LAYERS = __LAYERS_JSON__;
const ORIG   = {};

// ── Canvas init ─────────────────────────────────────────────────────────────
const cv = new fabric.Canvas('c', {
  width: CW,
  height: CH,
  backgroundColor: '#0b0f19',
  preserveObjectStacking: true,
});

// ── Load background image ────────────────────────────────────────────────────
// The background (photo + gradient + brackets, no text) is embedded as base64.
// We set it as a non-interactive object behind all text layers.
fabric.Image.fromURL(
  'data:image/png;base64,__BG_B64__',
  function(img) {
    img.set({
      left: 0, top: 0,
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      scaleX: CW / img.width,
      scaleY: CH / img.height,
    });
    cv.add(img);
    cv.sendToBack(img);
    addTextLayers();
    cv.requestRenderAll();
  },
  { crossOrigin: 'anonymous' }
);

// ── Font family helper ────────────────────────────────────────────────────────
// We don't have Inter available in the browser, so we use the closest
// system fonts.  Arial Black is visually similar to Inter ExtraBold.
function ff(weight) {
  if (weight === '900' || weight === '800') return 'Arial Black';
  if (weight === 'bold' || weight === '700') return 'Arial Bold';
  return 'Arial';
}

// ── Add text layers ──────────────────────────────────────────────────────────
// All coordinates in LAYERS are in PIL space (1080×1350).
// We multiply by SC (= DISPLAY_W / PIL_W) to convert to display space.
//
// Layers WITH maxWidth use fabric.Textbox so text auto-wraps at the width
// boundary (same behaviour as PIL draw_text_wrapped).
// Layers WITHOUT maxWidth use fabric.IText for single-line elements.
function addTextLayers() {
  LAYERS.forEach(function(cfg) {
    var x  = cfg.x * SC;
    var y  = cfg.y * SC;
    var sz = Math.max(6, Math.round(cfg.fontSize * SC));
    var mw = cfg.maxWidth
      ? Math.round(cfg.maxWidth * SC)
      : Math.round(CW - x - 12);

    var shared = {
      left:       x,
      top:        y,
      fontFamily: ff(cfg.fontWeight),
      fontSize:   sz,
      fontWeight: cfg.fontWeight || 'normal',
      fill:       cfg.fill || '#ffffff',
      lineHeight: 1.22,
      name:       cfg.id,
      hasControls:         true,
      hasBorders:          true,
      borderColor:         '#00D9FF55',
      cornerColor:         '#00D9FF',
      cornerSize:          7,
      cornerStyle:         'circle',
      transparentCorners:  false,
      padding:             3,
      cursorColor:         '#00D9FF',
      editingBorderColor:  '#00D9FF',
    };

    var obj;
    if (cfg.maxWidth) {
      // Textbox: auto word-wraps at 'width'
      obj = new fabric.Textbox(cfg.text || '', Object.assign({}, shared, {
        width:           mw,
        splitByGrapheme: false,
      }));
    } else {
      // IText: single-line, no auto-wrap
      obj = new fabric.IText(cfg.text || '', Object.assign({}, shared, {
        splitByGrapheme: false,
      }));
    }

    // Save originals so Reset can restore them
    ORIG[cfg.id] = {
      x:    x,
      y:    y,
      sz:   sz,
      fill: cfg.fill  || '#ffffff',
      text: cfg.text  || '',
    };

    cv.add(obj);
  });
}

// ── Toolbar helpers ──────────────────────────────────────────────────────────
function ga() {
  var o = cv.getActiveObject();
  return (o && (o.type === 'i-text' || o.type === 'textbox')) ? o : null;
}

function setEnabled(enabled) {
  ['btn-minus','btn-plus','btn-white','btn-cyan','btn-gray','btn-hide']
    .forEach(function(id) {
      document.getElementById(id).disabled = !enabled;
    });
}

function updateColorBtns(fill) {
  ['btn-white','btn-cyan','btn-gray'].forEach(function(id) {
    document.getElementById(id).classList.remove('active');
  });
  if (fill === '#ffffff') document.getElementById('btn-white').classList.add('active');
  if (fill === '#00D9FF') document.getElementById('btn-cyan').classList.add('active');
  if (fill === '#9ca3af') document.getElementById('btn-gray').classList.add('active');
}

function setSB(msg, active) {
  var el = document.getElementById('statusbar');
  el.textContent = msg;
  el.className = active ? 'on' : '';
}

// ── Toolbar actions ──────────────────────────────────────────────────────────
function cfs(delta) {                       // change font size
  var o = ga(); if (!o) return;
  var next = Math.max(6, (o.fontSize || 16) + delta);
  o.set('fontSize', next);
  cv.requestRenderAll();
  document.getElementById('fsdisp').textContent = Math.round(next) + 'px';
}

function sc(color) {                        // set color
  var o = ga(); if (!o) return;
  o.set('fill', color);
  cv.requestRenderAll();
  updateColorBtns(color);
}

function hs() {                             // hide selected
  var o = ga(); if (!o) return;
  o.set('visible', false);
  cv.discardActiveObject();
  cv.requestRenderAll();
  setEnabled(false);
  document.getElementById('fsdisp').textContent = '—';
  setSB('Element hidden — click ↺ Reset to restore all', false);
}

function ra() {                             // reset all
  cv.getObjects().forEach(function(o) {
    if (!o.name || !ORIG[o.name]) return;
    var r = ORIG[o.name];
    o.set({
      left: r.x, top: r.y,
      fontSize: r.sz, fill: r.fill,
      text: r.text, visible: true,
      scaleX: 1, scaleY: 1, angle: 0,
    });
    o.setCoords();
  });
  cv.discardActiveObject();
  cv.requestRenderAll();
  setEnabled(false);
  document.getElementById('fsdisp').textContent = '—';
  ['btn-white','btn-cyan','btn-gray'].forEach(function(id) {
    document.getElementById(id).classList.remove('active');
  });
  setSB('All elements reset to original positions', false);
}

function ex() {                             // export PNG
  var dataURL = cv.toDataURL({ format: 'png', multiplier: 2, quality: 1 });
  var a = document.createElement('a');
  a.href = dataURL;
  a.download = FN;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Canvas selection events ──────────────────────────────────────────────────
function onSelect(obj) {
  if (!obj || (obj.type !== 'i-text' && obj.type !== 'textbox')) return;
  setEnabled(true);
  document.getElementById('fsdisp').textContent = Math.round(obj.fontSize) + 'px';
  updateColorBtns(obj.fill);
  setSB(
    'Selected: ' + (obj.name || 'text') +
    ' · ' + Math.round(obj.fontSize) + 'px' +
    ' · Double-click to edit inline',
    true
  );
}

cv.on('selection:created', function(e) { onSelect(e.selected && e.selected[0]); });
cv.on('selection:updated', function(e) { onSelect(e.selected && e.selected[0]); });
cv.on('selection:cleared', function() {
  setEnabled(false);
  document.getElementById('fsdisp').textContent = '—';
  ['btn-white','btn-cyan','btn-gray'].forEach(function(id) {
    document.getElementById(id).classList.remove('active');
  });
  setSB('Click any text element to select it', false);
});

// Live font size readout while dragging resize handle
cv.on('object:scaling', function(e) {
  var o = e.target;
  if (o && (o.type === 'i-text' || o.type === 'textbox')) {
    var approx = Math.round(o.fontSize * Math.max(o.scaleX, o.scaleY));
    document.getElementById('fsdisp').textContent = approx + 'px';
  }
});

// On mouse-up after resize: convert scale factor back into fontSize
// so the object looks the same but scaleX/Y go back to 1 (cleaner state)
cv.on('object:modified', function(e) {
  var o = e.target;
  if (o && (o.type === 'i-text' || o.type === 'textbox') && (o.scaleX !== 1 || o.scaleY !== 1)) {
    var newSz = Math.max(6, Math.round(o.fontSize * Math.max(o.scaleX, o.scaleY)));
    o.set({ fontSize: newSz, scaleX: 1, scaleY: 1 });
    cv.requestRenderAll();
    document.getElementById('fsdisp').textContent = newSz + 'px';
  }
});

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  var o = ga();
  if (!o) return;
  if (o.isEditing) return;   // let normal typing work when editing inline

  // Font size: = or + to grow, - or _ to shrink
  if (e.key === '=' || e.key === '+') { e.preventDefault(); cfs(4);  }
  if (e.key === '-' || e.key === '_') { e.preventDefault(); cfs(-4); }

  // Escape: deselect
  if (e.key === 'Escape') { cv.discardActiveObject(); cv.requestRenderAll(); }

  // Delete / Backspace: hide (only when not in text-edit mode)
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    hs();
  }

  // Arrow keys: nudge 2px (Shift = 10px)
  var step = e.shiftKey ? 10 : 2;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); o.set('left', o.left - step); o.setCoords(); cv.requestRenderAll(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); o.set('left', o.left + step); o.setCoords(); cv.requestRenderAll(); }
  if (e.key === 'ArrowUp')    { e.preventDefault(); o.set('top',  o.top  - step); o.setCoords(); cv.requestRenderAll(); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); o.set('top',  o.top  + step); o.setCoords(); cv.requestRenderAll(); }
});
</script>
</body>
</html>"""
