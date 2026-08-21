const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

/**
 * Photo upload storage.
 *
 * Files persist on local disk under UPLOADS_ROOT/photos, served statically
 * at /uploads/photos/<filename> (see index.js). The directory survives
 * server restarts because it's a plain folder on disk, not tied to process
 * memory or an ephemeral tmp dir — AS LONG AS that disk itself survives.
 *
 * Production note: on a host with an ephemeral container filesystem (e.g.
 * Render's standard web service plans), the default path below is wiped on
 * every redeploy/restart. UPLOADS_DIR lets ops point this at a mounted
 * persistent disk (e.g. Render's Disks feature) without any code change —
 * unset, behavior is byte-for-byte identical to before. The URL scheme
 * (/uploads/photos/<uuid>.<ext>), the DB columns that store it
 * (user_photos.photo_url, user_profiles.profile_photo_url), and every API
 * response shape are all unaffected either way: only the real filesystem
 * location the app reads/writes moves.
 *
 * Security:
 *  - We NEVER use the client-supplied original filename for anything other
 *    than sniffing its extension for a friendlier debug name — the actual
 *    stored filename is a random UUID, so path traversal / overwrite / null
 *    byte tricks in the original name can't reach the filesystem.
 *  - Only a fixed whitelist of image mimetypes is accepted, and the file
 *    extension we write is derived from that whitelist (not from the
 *    original filename or the raw mimetype string), so a malicious
 *    `photo.php.jpg` or spoofed mimetype can't result in an executable
 *    extension landing in a public, statically-served directory.
 */

const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "..", "uploads");
const PHOTOS_DIR = path.join(UPLOADS_ROOT, "photos");

// Identity-verification documents (CNIC, selfie) live OUTSIDE UPLOADS_ROOT —
// index.js only ever statically-serves UPLOADS_ROOT at /uploads, so nothing
// under this separate directory is ever reachable by a plain URL. The only
// way to read one back is controllers/verificationController.js, which
// streams the file after checking the requester is either the owning user
// or an admin (adminAuth). ID documents are sensitive PII; they get the same
// "never publicly served" treatment real photos deliberately don't need.
const PRIVATE_UPLOADS_ROOT = process.env.PRIVATE_UPLOADS_DIR
  ? path.resolve(process.env.PRIVATE_UPLOADS_DIR)
  : path.join(__dirname, "..", "private-uploads");
const VERIFICATIONS_DIR = path.join(PRIVATE_UPLOADS_ROOT, "verifications");

// Ensure the directories exist on boot — safe to call every start, no-op if present.
fs.mkdirSync(PHOTOS_DIR, { recursive: true });
fs.mkdirSync(VERIFICATIONS_DIR, { recursive: true });

const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PHOTOS_DIR),
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype];
    const safeName = `${crypto.randomUUID()}${ext || ""}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!MIME_TO_EXT[file.mimetype]) {
    return cb(new Error("UNSUPPORTED_FILE_TYPE"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

// Same safety rules as the photo uploader (random UUID filename, fixed
// mimetype whitelist, 5MB cap) — the only difference is WHERE it writes.
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VERIFICATIONS_DIR),
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype];
    cb(null, `${crypto.randomUUID()}${ext || ""}`);
  },
});

const uploadVerificationDoc = multer({
  storage: verificationStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

module.exports = {
  upload, PHOTOS_DIR, UPLOADS_ROOT, MAX_FILE_SIZE_BYTES,
  uploadVerificationDoc, VERIFICATIONS_DIR,
};
