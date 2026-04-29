/**
 * Image Proxy — fetches ImageKit photos server-side to avoid CORS issues.
 *
 * Usage: /api/proxy-image?url=https://ik.imagekit.io/...
 *
 * Why this exists:
 * html-to-image draws the canvas using browser APIs. If the <img> src is a
 * cross-origin URL, the canvas gets "tainted" and the export fails.
 * Fetching through this server-side proxy returns the image as a same-origin
 * response, which html-to-image can use freely.
 */

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Security: only proxy our own ImageKit bucket
  if (!url.startsWith('https://ik.imagekit.io/wscyshoygv/')) {
    return res.status(403).json({ error: 'Only lostintransitjp ImageKit URLs are allowed' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LostInTransit-ImageProxy/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `ImageKit returned ${response.status}` });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Image proxy error:', error);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
}
