import { PercentCrop, PixelCrop } from "react-image-crop";

export const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const clampPercentCrop = (crop: PercentCrop): PercentCrop => {
  const width = clampValue(crop.width ?? 0, 1, 100);
  const height = clampValue(crop.height ?? 0, 1, 100);

  return {
    ...crop,
    width,
    height,
    x: clampValue(crop.x ?? 0, 0, 100 - width),
    y: clampValue(crop.y ?? 0, 0, 100 - height),
  };
};

export const getCroppedBlob = async (
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> => {
  if (!crop || crop.width <= 0 || crop.height <= 0) {
    throw new Error("Crop area is too small to process");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create canvas context");
  }

  const scaleX = image.naturalWidth / (image.width || 1);
  const scaleY = image.naturalHeight / (image.height || 1);
  const pixelWidth = Math.max(1, Math.round(crop.width));
  const pixelHeight = Math.max(1, Math.round(crop.height));

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    pixelWidth,
    pixelHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create image blob"));
      }
    }, "image/png");
  });
};
