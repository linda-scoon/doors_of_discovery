/**
 * What keeps the site safe to leave on the public internet.
 *
 *   - Security headers on every response, and a Content Security Policy on
 *     the page itself, so a script that somehow got into the page could not
 *     run, and no other site can frame it.
 *   - A per-visitor limit on /api, so nobody can hammer the server or spend
 *     the API keys' allowances by hand.
 */
const crypto = require('crypto');
const fs = require('fs');

/**
 * The hosts, beyond our own, that rooms load things from. Pictures and
 * sound come from many places (radio stations, Giphy, Deezer, Pexels,
 * Wikimedia...), so those are any https host; scripts, styles, fonts and
 * data only ever come from here. The only framed content is YouTube's.
 */
function contentSecurityPolicy(inlineScriptHashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHashes.join(' ')}`.trim(),
    // Angular puts each component's styles in a <style> element.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "font-src 'self'",
    "connect-src 'self'",
    'frame-src https://www.youtube-nocookie.com',
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/**
 * Fingerprints of the scripts written into the built page itself -- the
 * build adds one that loads the lettering. The policy allows exactly those
 * and no other inline script. Worked out from the page, so a rebuild that
 * changes the script cannot leave the policy blocking it.
 */
function inlineScriptHashes(indexFile) {
  try {
    const html = fs.readFileSync(indexFile, 'utf8');
    return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
      ([, body]) => `'sha256-${crypto.createHash('sha256').update(body).digest('base64')}'`
    );
  } catch {
    return [];
  }
}

/** Headers for every response. */
function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  });
  // Only over https: a browser ignores it otherwise, but say so properly.
  if (req.secure) {
    res.set('Strict-Transport-Security', 'max-age=15552000');
  }
  next();
}

/**
 * At most `limit` /api requests a minute from one visitor. Opening a door is
 * one or two, so nobody browsing comes near it.
 *
 * A visitor is told apart by address. Behind the host's proxy and a CDN, the
 * address is the one the nearest public hop reported -- see `trust proxy` in
 * index.js -- which a visitor cannot forge. With a CDN in front, everyone
 * behind one CDN node shares an address, which is why the limit is roomy.
 */
function rateLimit({ limit, windowMs = 60_000, maxTracked = 10_000 }) {
  const visitors = new Map();

  return function limitRequests(req, res, next) {
    const now = Date.now();
    const key = req.ip || 'unknown';
    let entry = visitors.get(key);

    if (!entry || now - entry.start >= windowMs) {
      // Forget the oldest visitor rather than grow without end.
      if (!entry && visitors.size >= maxTracked) {
        visitors.delete(visitors.keys().next().value);
      }
      entry = { start: now, count: 0 };
      visitors.delete(key);
      visitors.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > limit) {
      res.set('Retry-After', String(Math.ceil((entry.start + windowMs - now) / 1000)));
      res.set('Cache-Control', 'no-store');
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
    }
    next();
  };
}

module.exports = { contentSecurityPolicy, inlineScriptHashes, securityHeaders, rateLimit };
