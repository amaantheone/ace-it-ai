/**
 * Processes an image buffer and converts it to base64 format for use with Google Gemini Vision API
 * @param buffer Buffer containing image data
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns Promise<string> Base64 encoded image data
 */
export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  // Convert buffer to base64
  const base64Data = buffer.toString("base64");
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Validates if the file is a supported image type
 * @param mimeType The MIME type of the file
 * @returns boolean True if the file is a supported image type
 */
export function isSupportedImageType(mimeType: string): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return supportedTypes.includes(mimeType.toLowerCase());
}

/**
 * Gets the file extension from a MIME type
 * @param mimeType The MIME type of the file
 * @returns string The file extension
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return typeMap[mimeType.toLowerCase()] || "unknown";
}
