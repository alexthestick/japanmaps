// The CDN endpoint is public, not a credential. Restrict deletions to assets
// uploaded through this project's ImageKit account and the two Finds folders.
const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/wscyshoygv';
const PAGE_SIZE = 1000;
const MAX_PAGES = 100;

type FindPhoto = { photo_url: string | null };
type ImageKitAsset = { type: string; fileId: string; filePath: string; url: string };

export type ImageKitCleanupOperations = {
  listFindPhotos: (userId: string, from: number, to: number) => Promise<{ data: FindPhoto[] | null; error: unknown }>;
  // Must use an admin client: a user-supplied Find URL does not prove file ownership.
  isReferencedElsewhere: (userId: string, urls: string[]) => Promise<boolean>;
  listAssets: (folder: string, skip: number, limit: number) => Promise<ImageKitAsset[]>;
  deleteAsset: (fileId: string) => Promise<void>;
};

export class ImageKitCleanupError extends Error {
  readonly removedCount: number;
  constructor(removedCount: number) {
    super('ImageKit Finds cleanup failed');
    this.removedCount = removedCount;
  }
}

function parseFindImageKitUrl(value: string, userId: string): { canonicalUrl: string; folder: string; filePath: string } | null {
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  const endpoint = new URL(IMAGEKIT_ENDPOINT);
  if (url.origin !== endpoint.origin || !url.pathname.startsWith(`${endpoint.pathname}/`)) return null;
  const filePath = decodeURI(url.pathname.slice(endpoint.pathname.length));
  const folder = filePath.slice(0, filePath.lastIndexOf('/'));
  if (folder !== '/field-notes' && folder !== `/stores/${userId}`) throw new Error('Unrecognized Finds photo folder');
  if (!filePath.endsWith('/') && filePath.length > folder.length + 1 && !filePath.includes('/../')) {
    return { canonicalUrl: `${url.origin}${url.pathname}`, folder, filePath };
  }
  throw new Error('Invalid Finds photo path');
}

/** Resolve every user-owned Find URL to one exact ImageKit file before deleting any. */
export async function cleanupImageKitFindPhotos(operations: ImageKitCleanupOperations, userId: string): Promise<number> {
  let removedCount = 0;
  try {
    const photos = new Map<string, { folder: string; filePath: string }>();
    for (let page = 0; page < MAX_PAGES; page++) {
      const { data, error } = await operations.listFindPhotos(userId, page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error || !Array.isArray(data) || data.length > PAGE_SIZE) throw new Error('Find listing failed');
      for (const row of data) {
        if (typeof row?.photo_url !== 'string') continue;
        const parsed = parseFindImageKitUrl(row.photo_url, userId);
        if (parsed) photos.set(parsed.canonicalUrl, { folder: parsed.folder, filePath: parsed.filePath });
      }
      if (data.length < PAGE_SIZE) break;
      if (page === MAX_PAGES - 1) throw new Error('Find listing limit reached');
    }
    if (photos.size === 0) return 0;

    const urls = [...photos.keys()];
    if (await operations.isReferencedElsewhere(userId, urls)) throw new Error('Find photo is shared');

    const filesToDelete = new Map<string, string>();
    const folders = new Set([...photos.values()].map(({ folder }) => folder));
    for (const folder of folders) {
      let finished = false;
      for (let page = 0; page < MAX_PAGES; page++) {
        const assets = await operations.listAssets(folder, page * PAGE_SIZE, PAGE_SIZE);
        if (!Array.isArray(assets) || assets.length > PAGE_SIZE) throw new Error('ImageKit listing failed');
        for (const asset of assets) {
          if (asset?.type !== 'file' || typeof asset.fileId !== 'string' ||
            typeof asset.filePath !== 'string' || typeof asset.url !== 'string') continue;
          const canonicalUrl = asset.url.split('?')[0];
          const desired = photos.get(canonicalUrl);
          if (desired?.folder === folder && desired.filePath === asset.filePath) {
            if (filesToDelete.has(canonicalUrl)) throw new Error('Ambiguous ImageKit file');
            filesToDelete.set(canonicalUrl, asset.fileId);
          }
        }
        if (assets.length < PAGE_SIZE) { finished = true; break; }
      }
      if (!finished) throw new Error('ImageKit listing limit reached');
    }
    if (filesToDelete.size !== photos.size) throw new Error('Find photo not found in ImageKit');

    for (const fileId of filesToDelete.values()) {
      await operations.deleteAsset(fileId);
      removedCount++;
    }
    return removedCount;
  } catch {
    // No paths, URLs, IDs or provider error bodies escape to app responses/logs.
    throw new ImageKitCleanupError(removedCount);
  }
}
