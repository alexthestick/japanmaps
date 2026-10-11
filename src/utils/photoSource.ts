/** Prevent new Google-hosted photos from entering manual image workflows. */
export function isGoogleHostedPhotoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com')) return true;
    if (host === 'places.googleapis.com' && url.pathname.endsWith('/media')) return true;
    if (host === 'maps.googleapis.com' && url.pathname.includes('/maps/api/place/photo')) return true;
    return false;
  } catch {
    return false;
  }
}
