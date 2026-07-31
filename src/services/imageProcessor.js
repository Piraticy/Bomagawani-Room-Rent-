const sharp = require('sharp');

function createWatermarkSvg(width, height, logoText) {
  const boxWidth = Math.max(210, Math.floor(width * 0.32));
  const boxHeight = 58;
  const x = width - boxWidth - 24;
  const y = height - boxHeight - 20;
  const safeText = (logoText || 'Bomagawani.com').replace(/&/g, '&amp;').replace(/</g, '&lt;');

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="10" fill="rgba(10, 23, 38, 0.70)"/>
    <circle cx="${x + 24}" cy="${y + 29}" r="11" fill="#f4b87a"/>
    <path d="M ${x + 20} ${y + 31} L ${x + 24} ${y + 24} L ${x + 29} ${y + 34}" stroke="#1d232f" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="${x + 44}" y="${y + 36}" font-size="20" fill="#ffffff" font-family="Arial, sans-serif" font-weight="700">${safeText}</text>
  </svg>
  `;
}

function safeLogoText(value) {
  return String(value || 'Bomagawani.com').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function normalizeTarget(mode) {
  if (mode === 'hero') return { width: 1920, height: 1080, quality: 95 };
  if (mode === 'slide') return { width: 1920, height: 1080, quality: 95 };
  return { width: 1600, height: 1100, quality: 94 };
}

// `input` is either a Buffer (from multer memory storage) or a file path -
// sharp() accepts both transparently, so callers can pass whichever they have.
async function saveOriginalCopy(input) {
  return sharp(input).rotate().withMetadata().toBuffer();
}

async function watermarkImage(input, logoText, mode = 'room') {
  const target = normalizeTarget(mode);
  const base = sharp(input).rotate();
  const metadata = await base.metadata();

  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  const sourceBuffer = await base.toBuffer();

  const background = await sharp(sourceBuffer)
    .resize(target.width, target.height, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.94, saturation: 0.96 })
    .blur(18)
    .toBuffer();

  const foreground = await sharp(sourceBuffer)
    .resize(target.width, target.height, { fit: 'inside', withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 1.15, m1: 0.9, m2: 1.3 })
    .toBuffer({ resolveWithObject: true });

  const fgWidth = foreground.info.width || target.width;
  const fgHeight = foreground.info.height || target.height;
  const left = Math.max(0, Math.round((target.width - fgWidth) / 2));
  const top = Math.max(0, Math.round((target.height - fgHeight) / 2));
  const watermarkSvg = createWatermarkSvg(target.width, target.height, safeLogoText(logoText));

  const buffer = await sharp({
    create: {
      width: target.width,
      height: target.height,
      channels: 3,
      background: '#101b2f'
    }
  })
    .composite([
      {
        input: background,
        top: 0,
        left: 0
      },
      {
        input: foreground.data,
        top,
        left
      },
      {
        input: Buffer.from(watermarkSvg),
        top: 0,
        left: 0
      }
    ])
    .jpeg({ quality: target.quality, mozjpeg: true, progressive: true, chromaSubsampling: '4:4:4' })
    .toBuffer();

  return {
    buffer,
    originalWidth: width,
    originalHeight: height,
    outputWidth: target.width,
    outputHeight: target.height,
    mode
  };
}

module.exports = {
  watermarkImage,
  saveOriginalCopy
};
