// Guards against rendering a stored string as an <a href> when it could be a
// javascript: or data: URL — the server already restricts credential_data to
// https Cloudinary URLs on write, but this is the belt for that suspenders:
// a render-time check costs nothing and doesn't depend on every write path
// staying correct forever.
export function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}
