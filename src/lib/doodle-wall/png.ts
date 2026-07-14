/**
 * Minimal PNG header validation for untrusted tile submissions. Hand-parses
 * the fixed-layout signature + IHDR chunk from the raw bytes — no image
 * library, nothing is decoded, and non-PNG payloads (SVG especially) can
 * never pass because only the exact 8-byte PNG signature is accepted.
 *
 * Layout (PNG spec, RFC 2083): bytes 0–7 signature; bytes 8–11 IHDR length
 * (always 13); bytes 12–15 the ASCII type "IHDR"; bytes 16–19 width and
 * 20–23 height, both big-endian uint32.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Signature + IHDR length/type + width + height. */
const MIN_HEADER_BYTES = 24;

const IHDR_TYPE = [0x49, 0x48, 0x44, 0x52]; // "IHDR"

/**
 * Read the pixel dimensions of a PNG buffer, or null when the bytes are not
 * a well-formed PNG header (wrong signature, truncated, IHDR not first).
 */
export function readPngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < MIN_HEADER_BYTES) return null;
  if (PNG_SIGNATURE.some((byte, i) => bytes[i] !== byte)) return null;
  // IHDR must be the first chunk, with its spec-fixed 13-byte length.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8) !== 13) return null;
  if (IHDR_TYPE.some((byte, i) => bytes[12 + i] !== byte)) return null;
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width === 0 || height === 0) return null;
  return { width, height };
}
