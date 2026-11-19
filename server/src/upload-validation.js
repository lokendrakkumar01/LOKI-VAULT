export const validUploadContent = file => {
  const b = file.buffer;
  if (!b) return false;
  if (file.mimetype === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (file.mimetype === 'image/png') return b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === 'image/gif') return /^GIF8[79]a$/.test(b.subarray(0, 6).toString('ascii'));
  if (file.mimetype === 'image/webp') return b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP';
  if (file.mimetype === 'application/pdf') return b.subarray(0, 5).toString() === '%PDF-';
  if (['video/mp4', 'video/quicktime'].includes(file.mimetype)) return b.subarray(4, 8).toString() === 'ftyp';
  if (file.mimetype === 'video/webm') return b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
};
