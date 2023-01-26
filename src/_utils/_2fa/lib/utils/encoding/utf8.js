import { globalScope } from "../global-scope.js";

/**
 * TextEncoder instance.
 * @type {TextEncoder|null}
 */
const ENCODER = globalScope.TextEncoder
  ? new globalScope.TextEncoder("utf-8")
  : null;

/**
 * TextDecoder instance.
 * @type {TextDecoder|null}
 */
const DECODER = globalScope.TextDecoder
  ? new globalScope.TextDecoder("utf-8")
  : null;

/**
 * Converts an UTF-8 string to an ArrayBuffer.
 * @param {string} str String.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
const utf8ToBuf = (str) => {
  if (!ENCODER) {
    throw new Error("Encoding API not available");
  }

  return ENCODER.encode(str).buffer;
};

/**
 * Converts an ArrayBuffer to an UTF-8 string.
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} String.
 */
const utf8FromBuf = (buf) => {
  if (!DECODER) {
    throw new Error("Encoding API not available");
  }

  return DECODER.decode(buf);
};

export { utf8ToBuf, utf8FromBuf };
