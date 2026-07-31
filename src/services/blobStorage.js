const fs = require('fs');
const path = require('path');

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const isEnabled = !!blobToken;

let vercelBlob = null;
function getVercelBlob() {
  if (!vercelBlob) {
    // eslint-disable-next-line global-require
    vercelBlob = require('@vercel/blob');
  }
  return vercelBlob;
}

// Saves a processed image buffer and returns the URL to store in the DB.
// - When BLOB_READ_WRITE_TOKEN is set, uploads to Vercel Blob (works from any
//   environment, not just Vercel itself) and returns the resulting absolute URL.
// - Otherwise writes to local disk under uploadRootDir, exactly like before,
//   and returns the existing "/uploads/..." relative URL shape.
async function saveUpload(buffer, relativePath, uploadRootDir) {
  if (isEnabled) {
    const { put } = getVercelBlob();
    const result = await put(relativePath, buffer, {
      access: 'public',
      addRandomSuffix: false,
      token: blobToken
    });
    return result.url;
  }

  const absolutePath = path.join(uploadRootDir, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, buffer);
  return `/uploads/${relativePath}`;
}

// Deletes a previously-saved upload given the URL stored in the DB. Safe to
// call with a local "/uploads/..." URL even when Blob is enabled (a no-op,
// since that shape can never be a real Blob URL) and vice versa.
async function deleteUpload(url, removeLocalFn) {
  if (!url) return;

  if (isEnabled && /^https?:\/\//.test(url)) {
    try {
      const { del } = getVercelBlob();
      await del(url, { token: blobToken });
    } catch (error) {
      console.error('[blobStorage] Failed to delete blob:', error.message);
    }
    return;
  }

  if (!isEnabled && typeof removeLocalFn === 'function') {
    removeLocalFn(url);
  }
}

module.exports = {
  isEnabled,
  saveUpload,
  deleteUpload
};
