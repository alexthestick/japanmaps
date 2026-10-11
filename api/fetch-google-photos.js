/** Retired photo-copy endpoint. Keep the route explicit until deployment is approved. */
export const runtime = 'nodejs';

export default function handler(_req, res) {
  res.status(410).json({
    error: 'Google photo importing is no longer available. Add independently sourced photos instead.',
  });
}
