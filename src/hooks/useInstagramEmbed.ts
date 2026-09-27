import { useEffect, useRef } from 'react';

// Instagram/Threads embeds ship as raw <blockquote class="instagram-media">
// markup with the <script> tag stripped server-side (see discover-store's
// stripScriptTags — we never inject a remote <script> via
// dangerouslySetInnerHTML). Meta's embed.js is what turns that blockquote
// into the actual styled post preview; without it, the blockquote just
// renders as an unstyled link + text fallback. This hook lazily loads
// embed.js exactly once for the whole app (only admin pages that render an
// oEmbed card ever call it) and re-runs Meta's processor whenever new
// embed HTML shows up in the DOM.

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

let embedScriptPromise: Promise<void> | null = null;

function loadInstagramEmbedScript(): Promise<void> {
  if (embedScriptPromise) return embedScriptPromise;

  embedScriptPromise = new Promise((resolve, reject) => {
    // Already loaded by a previous mount (script tag persists across
    // React unmounts since we never remove it).
    if (window.instgrm) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-instagram-embed]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Instagram embed script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.dataset.instagramEmbed = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Instagram embed script'));
    document.body.appendChild(script);
  });

  return embedScriptPromise;
}

/**
 * Call with the raw oEmbed HTML currently rendered inside `containerRef`
 * (already placed there via dangerouslySetInnerHTML by the caller). Loads
 * embed.js on first use, then asks Meta's processor to hydrate any
 * unprocessed `.instagram-media` blockquotes in the document — it scans
 * globally, not just inside our container, so this is safe to call from
 * multiple cards without conflicting.
 */
export function useInstagramEmbed(html: string | null | undefined) {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!html) return;

    let cancelled = false;
    loadInstagramEmbedScript()
      .then(() => {
        if (cancelled || !mountedRef.current) return;
        // Give React a tick to commit the blockquote to the DOM before
        // Meta's processor scans for it.
        requestAnimationFrame(() => {
          try {
            window.instgrm?.Embeds.process();
          } catch (err) {
            console.error('Instagram embed processing failed:', err);
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
