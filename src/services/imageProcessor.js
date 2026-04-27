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

async function watermarkImage(filePath, outputPath, logoText) {
  const image = sharp(filePath).rotate();
  const metadata = await image.metadata();

  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  const watermarkSvg = createWatermarkSvg(width, height, logoText);

  await image
    .resize({ width: Math.min(width, 1800), withoutEnlargement: true })
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        top: 0,
        left: 0
      }
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(outputPath);
}

module.exports = {
  watermarkImage
};
