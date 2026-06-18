// Shared helpers used across index.js and the module definition files.
// Keep these pure (no dependency on the instance) so they are easy to unit test.

/**
 * Format a raw bits-per-second bitrate for display.
 * Returns 'No Data' when not receiving / unknown, a no-signal hint for 0,
 * otherwise a Mbps string with two decimals.
 *
 * @param {number|null|undefined} bitrate bits per second
 * @param {boolean} [receiving=true] whether the source is currently receiving
 * @returns {string}
 */
function formatBitrate(bitrate, receiving = true) {
    if (!receiving) return 'No Data'
    if (bitrate === undefined || bitrate === null) return 'No Data'
    if (bitrate === 0) return '0 Mbps (No Signal)'
    const mbps = (bitrate / 1000000).toFixed(2)
    return `${mbps} Mbps`
}

/**
 * Convert a service name into a safe Companion variable-id fragment.
 * Any character that is not a-z, A-Z, 0-9 or _ becomes _.
 *
 * @param {string} name
 * @returns {string}
 */
function sanitizeName(name) {
    return String(name).replace(/[^a-zA-Z0-9_]/g, '_')
}

module.exports = { formatBitrate, sanitizeName }
