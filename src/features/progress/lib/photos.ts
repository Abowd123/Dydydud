import { db, type ProgressPhoto } from '@/lib/db';
import { PHOTO_BUCKET, supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/sync/engine';
import { dateKey } from '@/lib/date';
import { useSettings } from '@/store/settings';

/** يصغّر الصورة لـ 1080px ويحولها JPEG، عشان ما تاكل مساحة الجوال */
export async function compressImage(file: File, max = 1080, quality = 0.82): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale), height = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', quality));
  return { blob, width, height };
}

export async function addPhoto(file: File, pose: ProgressPhoto['pose'], date = dateKey()) {
  const { blob, width, height } = await compressImage(file);
  const photo: ProgressPhoto = { id: crypto.randomUUID(), date, pose, blob, width, height, updatedAt: Date.now() };
  await db.photos.put(photo);
  if (useSettings.getState().cloudPhotos) void uploadPendingPhotos();
  return photo;
}

export const deletePhoto = async (p: ProgressPhoto) => {
  await db.photos.delete(p.id);
  if (supabase && p.remotePath) await supabase.storage.from(PHOTO_BUCKET).remove([p.remotePath]);
};

/** يرفع الصور اللي ما انرفعت (فقط لو المستخدم فعّل الخيار) لمجلد خاص فيه */
export async function uploadPendingPhotos() {
  const uid = getCurrentUserId();
  if (!supabase || !uid || !useSettings.getState().cloudPhotos) return;
  const pending = (await db.photos.toArray()).filter((p) => p.blob && !p.remotePath);
  for (const p of pending) {
    const path = `${uid}/${p.id}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, p.blob!, { contentType: 'image/jpeg', upsert: true });
    if (!error) await db.photos.update(p.id, { remotePath: path, updatedAt: Date.now() });
  }
}

const urlCache = new Map<string, string>();
/** رابط عرض للصورة: محلي (Blob) أو رابط موقّع مؤقت من السحابة */
export async function photoUrl(p: ProgressPhoto): Promise<string | null> {
  if (urlCache.has(p.id)) return urlCache.get(p.id)!;
  let url: string | null = null;
  if (p.blob) url = URL.createObjectURL(p.blob);
  else if (supabase && p.remotePath) {
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(p.remotePath, 3600);
    url = data?.signedUrl ?? null;
  }
  if (url) urlCache.set(p.id, url);
  return url;
}
