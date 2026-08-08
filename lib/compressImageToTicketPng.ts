export type CompressImageToTicketPngOptions = {
  maxWidth?: number
  /** Luminancia 0–255 por encima de la cual el píxel se vuelve transparente. */
  luminanceThreshold?: number
}

export type CompressedTicketPngImage = {
  blob: Blob
  previewUrl: string
  width: number
  height: number
  originalSize: number
  compressedSize: number
}

const DEFAULT_MAX_WIDTH = 400
const DEFAULT_LUMINANCE_THRESHOLD = 185
const MIN_ALPHA = 24

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

function fitWidth(
  width: number,
  height: number,
  maxWidth: number,
): { width: number; height: number } {
  if (width <= maxWidth) return { width, height }
  const ratio = maxWidth / width
  return {
    width: maxWidth,
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo convertir la imagen a PNG."))
          return
        }
        resolve(blob)
      },
      "image/png",
    )
  })
}

function toGrayscaleTicketPixels(
  data: Uint8ClampedArray,
  luminanceThreshold: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < MIN_ALPHA) {
      data[i + 3] = 0
      continue
    }

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b

    if (luminance >= luminanceThreshold) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 0
      continue
    }

    data[i] = 0
    data[i + 1] = 0
    data[i + 2] = 0
    data[i + 3] = 255
  }
}

export async function compressImageFileToTicketPng(
  file: File,
  options?: CompressImageToTicketPngOptions,
): Promise<CompressedTicketPngImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Elegí un archivo de imagen válido.")
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("La imagen supera el límite de 15 MB.")
  }

  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH
  const luminanceThreshold =
    options?.luminanceThreshold ?? DEFAULT_LUMINANCE_THRESHOLD

  const img = await loadImageFromFile(file)
  const fitted = fitWidth(img.naturalWidth, img.naturalHeight, maxWidth)

  const canvas = document.createElement("canvas")
  canvas.width = fitted.width
  canvas.height = fitted.height

  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen en este navegador.")
  }

  ctx.drawImage(img, 0, 0, fitted.width, fitted.height)
  const imageData = ctx.getImageData(0, 0, fitted.width, fitted.height)
  toGrayscaleTicketPixels(imageData.data, luminanceThreshold)
  ctx.putImageData(imageData, 0, 0)

  const blob = await canvasToPngBlob(canvas)
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

export function revokeCompressedTicketPngPreview(
  previewUrl: string | null | undefined,
) {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl)
  }
}
