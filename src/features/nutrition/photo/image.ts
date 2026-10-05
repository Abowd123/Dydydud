/** يصغر الصورة قبل الإرسال (768px، JPEG 0.75) عشان تكون سريعة وخفيفة على الباقة */
export async function compressImage(file: Blob, max = 768, quality = 0.75): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return canvas.toDataURL('image/jpeg', quality);
}
