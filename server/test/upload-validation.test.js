import test from 'node:test';
import assert from 'node:assert/strict';
import { validUploadContent } from '../src/upload-validation.js';

const file = (mimetype, signature) => ({ mimetype, buffer: Buffer.from(signature) });

test('accepts the signatures for the supported upload formats', () => {
  const cases = [
    ['image/jpeg', [0xff, 0xd8, 0xff, 0x00]],
    ['image/png', [137, 80, 78, 71, 13, 10, 26, 10]],
    ['image/gif', 'GIF89a'],
    ['image/webp', 'RIFF0000WEBP'],
    ['application/pdf', '%PDF-1.7'],
    ['video/mp4', '0000ftypisom'],
    ['video/quicktime', '0000ftypqt  '],
    ['video/webm', [0x1a, 0x45, 0xdf, 0xa3, 0x00]],
  ];
  for (const [mimetype, signature] of cases) assert.equal(validUploadContent(file(mimetype, signature)), true, mimetype);
});

test('rejects mismatched, empty, and unsupported file signatures', () => {
  assert.equal(validUploadContent(file('image/png', '%PDF-1.7')), false);
  assert.equal(validUploadContent({ mimetype: 'image/jpeg', buffer: Buffer.alloc(0) }), false);
  assert.equal(validUploadContent({ mimetype: 'image/jpeg' }), false);
  assert.equal(validUploadContent(file('text/html', '<script>')), false);
});
