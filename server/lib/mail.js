/**
 * Low-level mail transport — sends email through the Core-Gate HTTP API.
 *
 * This is the only place in the app that talks to Core-Gate (or to any mail
 * transport at all). Feature code should not call this directly; it goes
 * through ../emailService.js, which owns the templates and the per-email
 * subject/body wording.
 *
 * Configured entirely via environment variables:
 *   CORE_GATE_MAIL_KEY   required — API key sent as the x-api-key header
 *   MAIL_FROM            required — sender address (must be one Core-Gate allows)
 *   CORE_GATE_MAIL_URL   optional — override the endpoint (defaults below)
 */

const DEFAULT_ENDPOINT = "https://core-gate.ast.com.pk/api/email";

// Core-Gate is called from inside request handlers (e.g. signup OTP), so a
// stalled gateway must not hold an HTTP request open indefinitely.
const REQUEST_TIMEOUT_MS = 20000;

const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

// Validated on first send rather than at module load, so a server without mail
// configured still boots and serves every other route. The first send attempt
// then fails with a specific message instead of a generic crash or silent no-op.
function getConfig() {
    const missing = ["CORE_GATE_MAIL_KEY", "MAIL_FROM"].filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(
            `Email service is not configured: missing environment variable(s) ${missing.join(", ")}. ` +
            `Set CORE_GATE_MAIL_KEY and MAIL_FROM before sending email.`
        );
    }

    return {
        apiKey: process.env.CORE_GATE_MAIL_KEY,
        from: process.env.MAIL_FROM,
        endpoint: process.env.CORE_GATE_MAIL_URL || DEFAULT_ENDPOINT,
    };
}

/**
 * Send an email via Core-Gate.
 *
 * @param {string} to           recipient address (required)
 * @param {string} subject      subject line (required)
 * @param {string} text         body — treated as HTML unless useHtml is false (required)
 * @param {boolean} [useHtml]   treat `text`/`htmlContent` as HTML? defaults to true
 * @param {string} [htmlContent] HTML body, used instead of `text` when sending HTML
 * @param {Array}  [attachments] [{ filename, content (base64), encoding?, contentType? }]
 * @param {string} [bcc]        comma-separated addresses
 */
async function sendEmail(to, subject, text, useHtml = true, htmlContent = null, attachments = [], bcc = null) {
    if (!to || !subject || !text) {
        throw new Error("Missing required parameters: to, subject, and html/text.");
    }

    const { apiKey, from, endpoint } = getConfig();

    const payload = {
        from,
        to,
        subject,
        useHtml,
    };

    if (bcc && bcc.trim()) {
        payload.bcc = bcc.trim();
    }

    const shouldUseHtml = useHtml === true || useHtml === "true";
    if (shouldUseHtml) {
        payload.html = htmlContent || text;
    } else {
        payload.text = text;
    }

    if (attachments && attachments.length > 0) {
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        payload.attachments = attachments
            .map((attachment) => {
                if (!attachment.content || typeof attachment.content !== "string" || !base64Regex.test(attachment.content)) {
                    return null;
                }
                const formatted = {
                    filename: attachment.filename,
                    content: attachment.content,
                    encoding: attachment.encoding || "base64",
                };
                if (attachment.contentType) formatted.contentType = attachment.contentType;
                return formatted;
            })
            .filter((attachment) => attachment !== null);
    }

    // 10 MB payload cap — drop attachments rather than fail the send outright.
    if (JSON.stringify(payload).length > MAX_PAYLOAD_BYTES) {
        delete payload.attachments;
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch {
            // non-JSON error body — fall back to statusText below
        }
        throw new Error(`Failed to send Email. Status: ${response.status}, Response: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    return { status: true, message: "Email message sent successfully", data };
}

module.exports = { sendEmail };
