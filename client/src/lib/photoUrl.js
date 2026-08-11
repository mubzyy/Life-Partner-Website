/**
 * Profile photos are persisted on the backend and referenced by a relative
 * path (e.g. "/uploads/photos/<uuid>.jpg"), never a browser blob: URL and
 * never baked into a full URL server-side. This is the one place that turns
 * that relative path into something an <img> can load, by pointing it at
 * the same API origin that stored the file.
 */
const API_URL = import.meta.env.VITE_API_URL;

export function photoUrl(relativePath) {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath; // already absolute (e.g. external avatar service)
  return `${API_URL}${relativePath}`;
}
