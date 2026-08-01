// Suggests a correction for a mistyped email DOMAIN (e.g. "gmial.com" →
// "gmail.com"). It can only catch domain typos close to a known provider — it
// cannot detect a typo in the local part (e.g. "thomspon" vs "thompson"), since
// that's a valid, unknowable address. For those, deliverability/bounce tracking
// (Resend) is the real safeguard.

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "aol.com",
  "protonmail.com",
  "unilag.edu.ng",
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** Returns a suggested corrected email, or null if none / already valid domain. */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  for (const candidate of COMMON_DOMAINS) {
    const d = levenshtein(domain, candidate);
    if (d > 0 && d <= 2) return `${local}@${candidate}`;
  }
  return null;
}
