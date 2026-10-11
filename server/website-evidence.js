import { lookup as dnsLookup } from 'node:dns';
import https from 'node:https';
import net from 'node:net';

const USER_AGENT = 'LostInTransitDescriptionBot/1.0';
const MAX_RESPONSE_BYTES = 150_000;
const TIMEOUT_MS = 4_000;

function isPublicIPv4(address) {
  if (net.isIP(address) !== 4) return false;
  const [a, b, c] = address.split('.').map(Number);
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return !(a === 192 && b === 0 && c === 2);
}

export function safeWebsiteUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
    if (net.isIP(url.hostname) || url.hostname === 'localhost' || !url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

function publicLookup(hostname, options, callback) {
  dnsLookup(hostname, { all: true, family: 4 }, (error, addresses) => {
    if (error || !addresses?.length || addresses.some(({ address }) => !isPublicIPv4(address))) {
      callback(new Error('Website has no safe public address'));
      return;
    }
    callback(null, addresses[0].address, 4);
  });
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      lookup: publicLookup,
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/plain', 'Accept-Encoding': 'identity' },
    }, response => {
      // Do not follow redirects: every new host would need another safety and robots check.
      if (response.statusCode === 404) {
        response.resume();
        resolve({ status: 404, text: '' });
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('Website request was not successful'));
        return;
      }
      if (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity') {
        response.resume();
        reject(new Error('Compressed website response is not supported'));
        return;
      }
      const chunks = [];
      let size = 0;
      response.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) {
          request.destroy(new Error('Website response too large'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        const contentType = response.headers['content-type'] || '';
        const charset = /charset=([\w-]+)/i.exec(contentType)?.[1] || 'utf-8';
        let text;
        try { text = new TextDecoder(charset).decode(Buffer.concat(chunks)); }
        catch { text = Buffer.concat(chunks).toString('utf8'); }
        resolve({ status: 200, text, contentType });
      });
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('Website timed out')));
    request.on('error', reject);
  });
}

export function robotsAllows(robots, path) {
  let agents = [];
  let rules = [];
  let inRules = false;
  const groups = [];
  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === 'user-agent') {
      if (inRules) {
        groups.push({ agents, rules });
        agents = [];
        rules = [];
        inRules = false;
      }
      agents.push(value.toLowerCase());
    } else if (key === 'allow' || key === 'disallow') {
      inRules = true;
      rules.push({ key, value });
    }
  }
  groups.push({ agents, rules });
  const matching = groups.filter(group => group.agents.some(agent => agent === '*' || USER_AGENT.toLowerCase().startsWith(agent)));
  const applicable = matching.flatMap(group => group.rules).filter(rule => rule.value && path.startsWith(rule.value.split('*')[0]));
  applicable.sort((a, b) => b.value.length - a.value.length || (a.key === 'allow' ? -1 : 1));
  return applicable[0]?.key !== 'disallow';
}

export function htmlToPlainText(html) {
  return html
    .replace(/<\s*(script|style|noscript|svg|iframe)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, entity => ({ '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[entity.toLowerCase()] || ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

export async function fetchWebsiteEvidence(value, request = requestText) {
  const url = safeWebsiteUrl(value);
  if (!url) return '';
  try {
    const robots = await request(new URL('/robots.txt', url));
    if (robots.status !== 404 && !robotsAllows(robots.text, url.pathname || '/')) return '';
    const page = await request(url);
    if (!/^(text\/html|text\/plain)\b/i.test(page.contentType)) return '';
    return htmlToPlainText(page.text);
  } catch {
    // Missing, blocked, oversized, or slow sites are not evidence.
    return '';
  }
}
