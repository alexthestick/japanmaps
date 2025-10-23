export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidInstagramHandle(handle: string): boolean {
  const cleanHandle = handle.replace('@', '');
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
  return instagramRegex.test(cleanHandle);
}


