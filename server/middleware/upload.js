const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

/**
 * Photo upload storage.
 *
 * Files persist on local disk under server/uploads/photos, served statically
 * at /uploads/photos/<filename> (see index.js). The directory survives
 * server restarts because it's a plain folder on disk, not tied to process
 * memory or an ephemeral tmp dir.
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

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const PHOTOS_DIR = path.join(UPLOADS_ROOT, "photos");

// Ensure the directory exists on boot — safe to call every start, no-op if present.
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

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

module.exports = { upload, PHOTOS_DIR, UPLOADS_ROOT, MAX_FILE_SIZE_BYTES };
