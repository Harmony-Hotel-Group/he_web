@echo off
REM =========================================
REM Script de conversión de video con FFmpeg
REM Uso: convertir_video.bat input.mp4
REM Genera:
REM   - MP4 H.264
REM   - MP4 H.265 (HEVC)
REM   - WebM VP9
REM También versiones reducidas en 720p 30fps
REM =========================================

if "%~1"=="" (
    echo ❌ Error: Debes pasar un archivo de entrada
    echo Ejemplo: convertir_video.bat video.mp4
    exit /b 1
)

set INPUT=%~1
set BASENAME=%~n1

echo ▶ Convirtiendo %INPUT% a formatos optimizados...

REM =====================================================
REM VERSIONES CON RESOLUCION Y FPS ORIGINALES
REM =====================================================
echo --- Versiones originales ---

REM H.264 (MP4, compatibilidad máxima)
ffmpeg -i "%INPUT%" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k "%BASENAME%_h264.mp4"

REM H.265 (HEVC, más eficiente pero menos compatible)
ffmpeg -i "%INPUT%" -c:v libx265 -preset slow -crf 28 -c:a aac -b:a 128k "%BASENAME%_h265.mp4"

REM VP9 (WebM, muy eficiente en web)
ffmpeg -i "%INPUT%" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "%BASENAME%_vp9.webm"

REM =====================================================
REM VERSIONES REDUCIDAS (720p / 30fps)
REM =====================================================
echo --- Versiones reducidas (720p 30fps) ---

REM H.264 reducido
ffmpeg -i "%INPUT%" -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k "%BASENAME%_h264_720p30.mp4"

REM H.265 reducido
ffmpeg -i "%INPUT%" -vf "scale=1280:-2,fps=30" -c:v libx265 -preset slow -crf 28 -c:a aac -b:a 128k "%BASENAME%_h265_720p30.mp4"

REM VP9 reducido
ffmpeg -i "%INPUT%" -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus "%BASENAME%_vp9_720p30.webm"

echo ✅ Conversiones listas:
echo - %BASENAME%_h264.mp4
echo - %BASENAME%_h265.mp4
echo - %BASENAME%_vp9.webm
echo - %BASENAME%_h264_720p30.mp4
echo - %BASENAME%_h265_720p30.mp4
echo - %BASENAME%_vp9_720p30.webm
pause
