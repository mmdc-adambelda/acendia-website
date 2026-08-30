// Stateless, signed download tokens — no database needed. Gates access to
// a lead-magnet PDF to visitors who've just completed the lead form,
// without keeping any server-side session/record.
//
// Token = HMAC-SHA256(`${resource}:${exp}`, LEAD_MAGNET_DOWNLOAD_SECRET),
// verified by recomputing the same HMAC and comparing in constant time.
// `exp` is a Unix timestamp (seconds); tokens expire after
// TOKEN_TTL_SECONDS so a leaked/shared link stops working on its own.

const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 hours

function getSecret() {
  const secret = process.env.LEAD_MAGNET_DOWNLOAD_SECRET;
  if (!secret) {
    throw new Error('LEAD_MAGNET_DOWNLOAD_SECRET is not set.');
  }
  return secret;
}

function sign(resource, exp) {
  return crypto.createHmac('sha256', getSecret()).update(`${resource}:${exp}`).digest('hex');
}

/**
 * Issues a fresh, time-limited download token for the given resource slug.
 * @returns {{ token: string, exp: number }}
 */
function issueToken(resource) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  return { token: sign(resource, exp), exp };
}

/**
 * Verifies a resource/exp/token triple. Returns true only if the token is
 * a valid signature for that resource+exp AND exp hasn't passed.
 */
function verifyToken(resource, exp, token) {
  if (!resource || !exp || !token) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;

  const expected = sign(resource, expNum);
  const expectedBuf = Buffer.from(expected, 'hex');
  const givenBuf = Buffer.from(String(token), 'hex');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

module.exports = { issueToken, verifyToken, TOKEN_TTL_SECONDS };
