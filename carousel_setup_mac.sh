#!/bin/bash
# ============================================================
#  Lost in Transit — Carousel Generator Mac Setup
#  Run this once: bash carousel_setup_mac.sh
# ============================================================

echo ""
echo "======================================"
echo "  Lost in Transit — Carousel Setup"
echo "======================================"
echo ""

# 1. Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found."
    echo "   Install it from: https://www.python.org/downloads/"
    echo "   Or run: brew install python"
    exit 1
fi
echo "✓ Python 3 found: $(python3 --version)"

# 2. Install pip packages
echo ""
echo "Installing required packages..."
pip3 install Pillow requests supabase --quiet
echo "✓ Packages installed"

# 3. Set up fonts directory
FONT_DIR="$HOME/lost_in_transit_fonts"
mkdir -p "$FONT_DIR"

echo ""
echo "Setting up fonts..."

# Download Inter font directly (best match for your brand)
python3 - <<'PYEOF'
import urllib.request, os, sys

font_dir = os.path.expanduser("~/lost_in_transit_fonts")
os.makedirs(font_dir, exist_ok=True)

# Inter font - direct TTF downloads from GitHub releases
fonts = {
    "Inter-Regular.ttf":   "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip",
}

# Try downloading Inter zip and extracting
try:
    import urllib.request, zipfile, io
    print("  Downloading Inter font...")
    url = "https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=30).read()
    z = zipfile.ZipFile(io.BytesIO(data))
    # Extract specific weights we need
    weight_map = {
        "Inter-Regular.ttf":   ["Inter-Regular.ttf", "Inter Desktop/Inter-Regular.ttf"],
        "Inter-Bold.ttf":      ["Inter-Bold.ttf", "Inter Desktop/Inter-Bold.ttf"],
        "Inter-ExtraBold.ttf": ["Inter-ExtraBold.ttf", "Inter Desktop/Inter-ExtraBold.ttf"],
        "Inter-Medium.ttf":    ["Inter-Medium.ttf", "Inter Desktop/Inter-Medium.ttf"],
    }
    names_in_zip = z.namelist()
    for dest, candidates in weight_map.items():
        for c in candidates:
            if c in names_in_zip:
                data_f = z.read(c)
                with open(os.path.join(font_dir, dest), "wb") as f:
                    f.write(data_f)
                print(f"  ✓ {dest}")
                break
    print("  Fonts downloaded successfully")
    sys.exit(0)
except Exception as e:
    print(f"  Download failed: {e}")
    print("  Falling back to system fonts...")

# Fallback: use macOS system fonts
fallback_paths = [
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/SFNS.ttf",
]
found = None
for p in fallback_paths:
    if os.path.exists(p):
        found = p
        break

if found:
    import shutil
    for name in ["Inter-Regular.ttf", "Inter-Bold.ttf", "Inter-ExtraBold.ttf", "Inter-Medium.ttf"]:
        shutil.copy(found, os.path.join(font_dir, name))
    print(f"  ✓ Using system font: {found}")
else:
    print("  ⚠ No system font found — script will use default.")
PYEOF

echo "✓ Fonts ready"

# 4. Create output directory
mkdir -p "$HOME/Desktop/carousel_output"
echo "✓ Output folder: ~/Desktop/carousel_output"

# 5. Update font path in generator script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATOR="$SCRIPT_DIR/carousel_generator.py"

if [ -f "$GENERATOR" ]; then
    # Replace the FONT_DIR line with the actual Mac path
    sed -i '' "s|FONT_DIR = \"/sessions/nifty-optimistic-ritchie/fonts\"|FONT_DIR = \"$FONT_DIR\"|g" "$GENERATOR"
    echo "✓ Generator script configured"
else
    echo "⚠ carousel_generator.py not found in $SCRIPT_DIR"
fi

echo ""
echo "======================================"
echo "  ✅ Setup complete!"
echo ""
echo "  To run the carousel generator:"
echo "  python3 carousel_generator.py"
echo ""
echo "  Slides will be saved to:"
echo "  ~/Desktop/carousel_output/"
echo "======================================"
echo ""
