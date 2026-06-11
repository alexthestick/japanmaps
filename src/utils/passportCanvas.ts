/**
 * passportCanvas.ts
 *
 * Draws a "Lost in Transit" passport share card onto an HTML canvas.
 * Returns a Blob suitable for Web Share API or <a download>.
 *
 * Canvas size: 1080×1080 (square, Instagram-safe).
 * Layout:
 *   - Dark background (#0a0a0f)
 *   - Subtle cyan grid line across the top third
 *   - Up to 9 stamp photos in a 3-column grid with perforated gap lines
 *   - Username + stamp count below the grid
 *   - "lostintransitjp.com" wordmark at the bottom
 *
 * Image loading strategy:
 *   Fetch each photo URL as a blob via fetch() then draw via createObjectURL().
 *   This avoids canvas CORS taint from <img> tags. Falls back to a placeholder
 *   rectangle if any individual image fails to load.
 */

const CANVAS_SIZE   = 1080;
const PADDING       = 54;
const GRID_COLS     = 3;
const GRID_GAP      = 8;
const HEADER_HEIGHT = 100;  // space above the grid
// FOOTER_HEIGHT reserved for future layout adjustments
// const FOOTER_HEIGHT = 140;

const CELL_SIZE = Math.floor(
  (CANVAS_SIZE - PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
);

// ─── Fetch image as drawable ImageBitmap (CORS-safe) ─────────────────────────

async function loadImage(url: string): Promise<ImageBitmap | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await createImageBitmap(blob);
  } catch {
    return null;
  }
}

// ─── Draw a single stamp cell ─────────────────────────────────────────────────

function drawStampCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  img: ImageBitmap | null,
  index: number,
) {
  ctx.save();

  // Cell background
  ctx.fillStyle = '#111118';
  ctx.fillRect(x, y, size, size);

  if (img) {
    // Cover-fit the image into the cell
    const scale = Math.max(size / img.width, size / img.height);
    const dw = img.width  * scale;
    const dh = img.height * scale;
    const dx = x + (size - dw) / 2;
    const dy = y + (size - dh) / 2;

    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);

    // Subtle dark gradient overlay at bottom so index number is readable
    const grad = ctx.createLinearGradient(x, y + size * 0.55, x, y + size);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, size, size);
  } else {
    // Placeholder: faint stamp outline
    ctx.strokeStyle = 'rgba(34,217,238,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    ctx.fillStyle = 'rgba(34,217,238,0.2)';
    ctx.font = `bold ${Math.round(size * 0.28)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◎', x + size / 2, y + size / 2);
  }

  // Stamp index number (bottom-right)
  const numSize = Math.round(size * 0.11);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `bold ${numSize}px system-ui`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${index + 1}`, x + size - 6, y + size - 5);

  // Perforated edge (dashed lines on all 4 sides simulated via dots)
  ctx.strokeStyle = 'rgba(34,217,238,0.22)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  ctx.setLineDash([]);

  ctx.restore();
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ShareCardData {
  checkins: Array<{ photo_url: string | null; store_name: string }>;
  username: string;
}

export async function generatePassportShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width  = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Subtle top glow
  const topGlow = ctx.createRadialGradient(
    CANVAS_SIZE / 2, 0, 0,
    CANVAS_SIZE / 2, 0, CANVAS_SIZE * 0.6,
  );
  topGlow.addColorStop(0,   'rgba(34,217,238,0.06)');
  topGlow.addColorStop(1,   'rgba(34,217,238,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Bottom purple glow
  const bottomGlow = ctx.createRadialGradient(
    CANVAS_SIZE * 0.8, CANVAS_SIZE, 0,
    CANVAS_SIZE * 0.8, CANVAS_SIZE, CANVAS_SIZE * 0.6,
  );
  bottomGlow.addColorStop(0, 'rgba(168,85,247,0.05)');
  bottomGlow.addColorStop(1, 'rgba(168,85,247,0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // ── Header: wordmark + tagline ──────────────────────────────────────────
  const headerY = PADDING;

  ctx.fillStyle = '#22D9EE';
  ctx.font = `900 italic 38px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Lost in Transit', PADDING, headerY);

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = `400 22px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Japan Store Passport', PADDING, headerY + 46);

  // Corner decoration (top-right)
  ctx.strokeStyle = 'rgba(34,217,238,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CANVAS_SIZE - PADDING, PADDING);
  ctx.lineTo(CANVAS_SIZE - PADDING - 28, PADDING);
  ctx.moveTo(CANVAS_SIZE - PADDING, PADDING);
  ctx.lineTo(CANVAS_SIZE - PADDING, PADDING + 28);
  ctx.stroke();

  // ── Load photos (max 9) ─────────────────────────────────────────────────
  const stampsToShow = data.checkins.slice(0, 9);
  const images = await Promise.all(
    stampsToShow.map(c => (c.photo_url ? loadImage(c.photo_url) : Promise.resolve(null)))
  );

  // ── Stamp grid ───────────────────────────────────────────────────────────
  const gridTop = PADDING + HEADER_HEIGHT;

  for (let i = 0; i < stampsToShow.length; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const x = PADDING + col * (CELL_SIZE + GRID_GAP);
    const y = gridTop + row * (CELL_SIZE + GRID_GAP);
    drawStampCell(ctx, x, y, CELL_SIZE, images[i], i);
  }

  // Empty placeholder cells to fill the grid to 9
  for (let i = stampsToShow.length; i < 9; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const x = PADDING + col * (CELL_SIZE + GRID_GAP);
    const y = gridTop + row * (CELL_SIZE + GRID_GAP);
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
  }

  // ── Footer: username + stamp count ──────────────────────────────────────
  const footerTop = gridTop + 3 * (CELL_SIZE + GRID_GAP) + 24;

  // Divider line
  ctx.strokeStyle = 'rgba(34,217,238,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, footerTop - 12);
  ctx.lineTo(CANVAS_SIZE - PADDING, footerTop - 12);
  ctx.stroke();

  // Stamp count (large)
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 52px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${data.checkins.length}`, PADDING, footerTop);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = `400 22px system-ui, -apple-system, sans-serif`;
  ctx.fillText(data.checkins.length === 1 ? 'store stamped' : 'stores stamped', PADDING + 72, footerTop + 18);

  // Username
  ctx.fillStyle = 'rgba(34,217,238,0.7)';
  ctx.font = `600 22px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`@${data.username}`, CANVAS_SIZE - PADDING, footerTop + 18);

  // Bottom URL
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = `400 18px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('lostintransitjp.com', CANVAS_SIZE / 2, CANVAS_SIZE - PADDING);

  // ── Export as Blob ───────────────────────────────────────────────────────
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}
