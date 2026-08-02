export type CompressImageToWebpOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export type CompressedWebpImage = {
  blob: Blob
  previewUrl: string
  width: number
  height: number
  originalSize: number
  compressedSize: number
}

const DEFAULT_MAX_WIDTH = 1280
const DEFAULT_MAX_HEIGHT = 1280
const DEFAULT_QUALITY = 0.82

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("No se pudo leer la imagen seleccionada."))
    }
    img.src = url
  })
}

function fitInside(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen."))
          return
        }
        resolve(blob)
      },
      "image/webp",
      quality,
    )
  })
}

export async function compressImageFileToWebp(
  file: File,
  options?: CompressImageToWebpOptions,
): Promise<CompressedWebpImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Elegí un archivo de imagen válido.")
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("La imagen supera el límite de 15 MB.")
  }

  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH
  const maxHeight = options?.maxHeight ?? DEFAULT_MAX_HEIGHT
  const quality = options?.quality ?? DEFAULT_QUALITY

  const img = await loadImageFromFile(file)
  const fitted = fitInside(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight)

  const canvas = document.createElement("canvas")
  canvas.width = fitted.width
  canvas.height = fitted.height

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen en este navegador.")
  }

  ctx.drawImage(img, 0, 0, fitted.width, fitted.height)
  const blob = await canvasToWebpBlob(canvas, quality)
  const previewUrl = URL.createObjectURL(blob)

  return {
    blob,
    previewUrl,
    width: fitted.width,
    height: fitted.height,
    originalSize: file.size,
    compressedSize: blob.size,
  }
}

export function revokeCompressedWebpPreview(previewUrl: string | null | undefined) {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl)
  }
}
