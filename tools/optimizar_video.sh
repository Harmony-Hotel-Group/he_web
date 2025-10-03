#!/bin/bash
# =========================================
# Script de conversión de video con FFmpeg
# Uso: ./convertir_video.sh input.mp4
# Genera:
#   - H.264 (MP4)
#   - H.265 (HEVC, MP4)
#   - VP9 (WebM)
# También versiones reducidas en 720p 30fps
# =========================================

if [ -z "$1" ]; then
  echo "❌ Error: Debes pasar un archivo de entrada"
  echo "Ejemplo: ./convertir_video.sh video.mp4"
  exit 1
fi

INPUT="$1"
BASENAME=$(basename "$INPUT" | cut -d. -f1)

echo "▶ Convirtiendo $INPUT a formatos optimizados..."

# ===============================
# VERSIONES ORIGINALES
# ===============================
echo "--- Versiones originales ---"

# H.264
ffmpeg -i "$INPUT" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k "${BASENAME}_h264.mp4"

# H.265
ffmpeg -i "$INPUT" -c:v libx265 -preset slow -crf 28 -c:a aac -b:a 128k "${BASENAME}_h265.mp4"

# VP9
ffmpeg -i "$INPUT" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${BASENAME}_vp9.webm"

# ===============================
# VERSIONES REDUCIDAS (720p / 30fps)
# ===============================
echo "--- Versiones reducidas (720p 30fps) ---"

# H.264 reducido
ffmpeg -i "$INPUT" -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k "${BASENAME}_h264_720p30.mp4"

# H.265 reducido
ffmpeg -i "$INPUT" -vf "scale=1280:-2,fps=30" -c:v libx265 -preset slow -crf 28 -c:a aac -b:a 128k "${BASENAME}_h265_720p30.mp4"

# VP9 reducido
ffmpeg -i "$INPUT" -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "${BASENAME}_vp9_720p30.webm"

echo "✅ Conversiones listas:"
echo "- ${BASENAME}_h264.mp4"
echo "- ${BASENAME}_h265.mp4"
echo "- ${BASENAME}_vp9.webm"
echo "- ${BASENAME}_h264_720p30.mp4"
echo "- ${BASENAME}_h265_720p30.mp4"
echo "- ${BASENAME}_vp9_720p30.webm"
