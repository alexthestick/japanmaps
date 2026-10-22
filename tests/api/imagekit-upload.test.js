import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { uploadToImageKit } from '../../api/imagekit-upload.js';

test('uploads a named File through the ImageKit v7 files API', async () => {
  const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  const fileName = 'sample.jpg';
  const userId = 'a11b22c3-d444-4e55-8f66-778899aabbcc';
  const uploadResult = {
    url: 'https://ik.imagekit.io/example/sample.jpg',
    fileId: 'uploaded-file',
    thumbnailUrl: 'https://ik.imagekit.io/example/tr:n-thumb/sample.jpg',
    width: 20,
    height: 10,
    size: buffer.length,
    fileType: 'image',
  };
  const upload = mock.fn(async () => uploadResult);

  const result = await uploadToImageKit({ files: { upload } }, buffer, fileName, userId);

  assert.equal(upload.mock.callCount(), 1);
  const [request] = upload.mock.calls[0].arguments;
  assert.equal(request.fileName, fileName);
  assert.equal(request.file.name, fileName);
  assert.deepEqual(Buffer.from(await request.file.arrayBuffer()), buffer);
  assert.equal(request.folder, `/stores/${userId}`);
  assert.equal(request.useUniqueFileName, true);
  assert.deepEqual(request.tags, ['store', 'japan-maps', userId]);
  assert.strictEqual(result, uploadResult);
});
