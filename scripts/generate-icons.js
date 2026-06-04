/**
 * Generate simple PWA icons for Full Chair.
 * Uses pure Node.js to create minimal valid PNG files with a purple background
 * and a white "FC" text representation.
 *
 * These are placeholder icons — replace with proper branded assets when available.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(size) {
  // Build raw RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.45;

  // Brand purple: #9333ea → rgb(147, 51, 234)
  const brandR = 147, brandG = 51, brandB = 234;

  // Background: #f9fafb → rgb(249, 250, 251)
  const bgR = 249, bgG = 250, bgB = 251;

  // White for the letter area
  const letterR = 255, letterG = 255, letterB = 255;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside the circle — brand purple
        // Add a simple "FC" by drawing block letters in the center
        const relX = (x - cx) / radius; // -1 to 1
        const relY = (y - cy) / radius; // -1 to 1

        let isLetter = false;

        // "F" — left side (-0.55 to -0.05)
        const fLeft = -0.55, fRight = -0.05;
        const fTop = -0.35, fBottom = 0.35;
        const barW = 0.12; // vertical bar width
        const barH = 0.10; // horizontal bar height

        // F vertical bar
        if (relX >= fLeft && relX <= fLeft + barW && relY >= fTop && relY <= fBottom) {
          isLetter = true;
        }
        // F top horizontal bar
        if (relX >= fLeft && relX <= fRight && relY >= fTop && relY <= fTop + barH) {
          isLetter = true;
        }
        // F middle horizontal bar
        if (relX >= fLeft && relX <= fRight - 0.05 && relY >= -0.05 && relY <= -0.05 + barH) {
          isLetter = true;
        }

        // "C" — right side (0.05 to 0.55)
        const cLeft = 0.10, cRight = 0.55;
        const cTop = -0.35, cBottom = 0.35;

        // C top horizontal bar
        if (relX >= cLeft && relX <= cRight && relY >= cTop && relY <= cTop + barH) {
          isLetter = true;
        }
        // C bottom horizontal bar
        if (relX >= cLeft && relX <= cRight && relY >= cBottom - barH && relY <= cBottom) {
          isLetter = true;
        }
        // C left vertical bar
        if (relX >= cLeft && relX <= cLeft + barW && relY >= cTop && relY <= cBottom) {
          isLetter = true;
        }

        if (isLetter) {
          pixels[idx] = letterR;
          pixels[idx + 1] = letterG;
          pixels[idx + 2] = letterB;
          pixels[idx + 3] = 255;
        } else {
          pixels[idx] = brandR;
          pixels[idx + 1] = brandG;
          pixels[idx + 2] = brandB;
          pixels[idx + 3] = 255;
        }
      } else {
        // Outside circle — light background
        pixels[idx] = bgR;
        pixels[idx + 1] = bgG;
        pixels[idx + 2] = bgB;
        pixels[idx + 3] = 255;
      }
    }
  }

  // Build PNG file manually
  // PNG uses filter byte (0 = None) before each row, then deflate-compressed
  const rawData = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    rawData[rowStart] = 0; // filter: None
    pixels.copy(rawData, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper: create a PNG chunk
  function makeChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);

    const crcInput = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcInput);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);

    return Buffer.concat([length, typeBuffer, data, crcBuf]);
  }

  // CRC32 implementation
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, "..", "public", "icons");

const icon192 = createPNG(192);
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), icon192);
console.log("Created icon-192.png (" + icon192.length + " bytes)");

const icon512 = createPNG(512);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), icon512);
console.log("Created icon-512.png (" + icon512.length + " bytes)");

console.log("Done! Icons are placeholder — replace with branded assets when ready.");
