import { useEffect, useRef } from 'react';

// discover-store's oEmbed fetch hits two different Meta endpoints depending
// on the source platform (Instagram vs. Threads — see fetchOEmbed() in
// supabase/functions/discover-store/index.ts), and the two return
// differently-shaped blockquote markup:
//   - Instagram: <blockquote class="instagram-media" ...>
//   - Threads:   <blockquote class="text-post-media" ...>
// Each needs its OWN embed script to turn the raw (script-stripped)
// blockquote into the actual rendered post — Instagram's
// instagram.com/embed.js does not process Threads markup and vice versa
// (confirmed against Meta's own Threads embed docs, which specify
// threads.com/embed.js as the separate, required script). We load
// whichever one the html actually needs, lazily, the same way for both.

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

type Platform = 'instagram' | 'threads';

function detectPlatform(html: string): Platform | null {
  if (html.includes('text-post-media')) return 'threads';
  if (html.includes('instagram-media')) return 'instagram';
  return null;
}

const SCRIPT_SRC: Record<Platform, string> = {
  instagram: 'https://www.instagram.com/embed.js',
  threads: 'https://www.threads.com/embed.js',
};

const scriptPromises: Partial<Record<Platform, Promise<void>>> = {};

function loadEmbedScript(platform: Platform): Promise<void> {
  const existing = scriptPromises[platform];
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const marker = `data-embed-${platform}`;
    const existingTag = document.querySelector<HTMLScriptElement>(`script[${marker}]`);
    if (existingTag) {
      existingTag.addEventListener('load', () => resolve());
      existingTag.addEventListener('error', () => reject(new Error(`Failed to load ${platform} embed script`)));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC[platform];
    script.async = true;
    script.setAttribute(`data-embed-${platform}`, 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${platform} embed script`));
    document.body.appendChild(script);
  });

  scriptPromises[platform] = promise;
  return promise;
}

/**
 * Call with the raw oEmbed HTML currently rendered inside the caller's DOM
 * (placed there via dangerouslySetInnerHTML). Loads the matching platform's
 * embed script on first use and asks it to process the page.
 *
 * Both Meta scripts are documented to scan-and-render on load; neither
 * publicly documents a manual re-scan API the way Instagram's
 * `instgrm.Embeds.process()` is documented for Instagram specifically. We
 * call `window.instgrm?.Embeds.process()` defensively after every mount
 * (harmless no-op if it's not the right script for this platform) since
 * that's the one documented re-process hook available — if a Threads
 * embed added after initial script load doesn't render, the raw
 * blockquote still falls back to a clickable permalink, so nothing breaks.
 */
export function useSocialEmbed(html: string | null | undefined) {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!html) return;
    const platform = detectPlatform(html);
    if (!platform) return;

    let cancelled = false;
    loadEmbedScript(platform)
      .then(() => {
        if (cancelled || !mountedRef.current) return;
        requestAnimationFrame(() => {
          try {
            window.instgrm?.Embeds.process();
          } catch (err) {
            console.error('Social embed processing failed:', err);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, [html]);
}
