#!/usr/bin/env bash
# يحوّل فيديوهات التمارين الخام إلى صيغ خفيفة جاهزة للتطبيق
# الاستخدام: حط الفيديوهات في media-raw/<exercise-id>.mp4 ثم شغّل: npm run media
# المتطلبات: ffmpeg
set -euo pipefail
IN=media-raw
OUT=public/media/exercises
command -v ffmpeg >/dev/null || { echo "❌ ثبّت ffmpeg أول"; exit 1; }

for f in "$IN"/*.{mp4,mov,MOV,MP4}; do
  [ -e "$f" ] || continue
  id=$(basename "${f%.*}")
  dir="$OUT/$id"; mkdir -p "$dir"
  echo "🎬 $id"
  # أول 8 ثواني، مقاس 720 مربع، بدون صوت
  VF="scale=720:720:force_original_aspect_ratio=increase,crop=720:720,fps=30"
  ffmpeg -y -loglevel error -i "$f" -t 8 -an -vf "$VF" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 "$dir/video.webm"
  ffmpeg -y -loglevel error -i "$f" -t 8 -an -vf "$VF" -c:v libx264 -profile:v main -crf 28 -preset slow -movflags +faststart -pix_fmt yuv420p "$dir/video.mp4"
  ffmpeg -y -loglevel error -ss 1 -i "$f" -frames:v 1 -vf "$VF" -c:v libwebp -quality 78 "$dir/poster.webp"
  ffmpeg -y -loglevel error -ss 1 -i "$f" -frames:v 1 -vf "scale=360:270:force_original_aspect_ratio=increase,crop=360:270" -c:v libwebp -quality 72 "$dir/thumb.webp"
  du -h "$dir"/* | sed 's/^/   /'
done
echo "✅ خلصت"
