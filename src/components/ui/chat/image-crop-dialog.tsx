'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { PercentCrop, PixelCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { clampPercentCrop, getCroppedBlob } from "./crop-utils";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropDialogProps {
  isOpen: boolean;
  sourceFile: File | null;
  onClose: () => void;
  onCropComplete: (file: File) => void;
}

const DEFAULT_CROP: PercentCrop = {
  unit: "%",
  x: 10,
  y: 10,
  width: 80,
  height: 80,
};

export function ImageCropDialog({
  isOpen,
  sourceFile,
  onClose,
  onCropComplete,
}: ImageCropDialogProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<PercentCrop>(DEFAULT_CROP);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDataUrl(null);
      setCrop(DEFAULT_CROP);
      setCompletedCrop(null);
      setError(null);
      setIsProcessing(false);
      return;
    }

    if (sourceFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setDataUrl(reader.result as string);
        setCrop(DEFAULT_CROP);
        setCompletedCrop(null);
        setError(null);
      };
      reader.onerror = () => {
        setError("We couldn't read the image. Please try a different file.");
      };
      reader.readAsDataURL(sourceFile);
    } else {
      setDataUrl(null);
    }
  }, [isOpen, sourceFile]);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    imageRef.current = image;

    const isPortrait = image.naturalHeight >= image.naturalWidth;
    const width = isPortrait ? 90 : 80;
    const height = isPortrait ? 80 : 60;
    const initialCrop = clampPercentCrop({
      unit: "%",
      x: 5,
      y: 5,
      width,
      height,
    });

    setCrop(initialCrop);
    setCompletedCrop(
      convertToPixelCrop(initialCrop, image.width, image.height)
    );
  }, []);

  const handleCropChange = useCallback(
    (_pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setCrop(clampPercentCrop(percentCrop));
    },
    []
  );

  const handleCropComplete = useCallback((pixelCrop: PixelCrop) => {
    setCompletedCrop(pixelCrop);
  }, []);

  const handleUseImage = useCallback(async () => {
    if (!dataUrl || !completedCrop) {
      setError("Please adjust the crop before continuing.");
      return;
    }

    const image = imageRef.current;
    if (!image) {
      setError("Image failed to load. Please try again.");
      return;
    }

    try {
      setIsProcessing(true);
      const blob = await getCroppedBlob(image, completedCrop);
      const extension = sourceFile?.name.split(".").pop() || "png";
      const fileName = sourceFile?.name
        ? `${sourceFile.name.replace(/\.[^/.]+$/, "")}-cropped.${extension}`
        : `chat-image-${Date.now()}.png`;
      const file = new File([blob], fileName, {
        type: blob.type || sourceFile?.type || "image/png",
      });

      onCropComplete(file);
      onClose();
    } catch (err) {
      console.error("Failed to crop image", err);
      setError("Something went wrong while processing the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, dataUrl, onClose, onCropComplete, sourceFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className={cn("relative h-full w-full overflow-auto", isProcessing && "pointer-events-none opacity-80")}>
        {/* Header with close button */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>

          <span className="text-sm font-medium text-white">Crop image</span>

          <div className="w-10" />
        </div>

        {/* Crop area */}
        <div className="flex h-full w-full items-center justify-center p-4">
          {!dataUrl ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              <div className="text-sm text-white/60">{error ? "Error loading image" : "Preparing image..."}</div>
            </div>
          ) : (
            <ReactCrop
              crop={crop}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              className="max-h-full max-w-full"
              ruleOfThirds
              keepSelection
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={dataUrl}
                alt="Image to crop"
                onLoad={handleImageLoad}
                className="max-h-full w-auto object-contain"
              />
            </ReactCrop>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute left-0 right-0 top-24 mx-4 rounded-lg bg-red-500/10 border border-red-500/50 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 py-6">
          <button
            onClick={onClose}
            className="flex h-12 items-center gap-2 rounded-lg bg-white/10 px-4 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            <X size={20} />
            <span className="text-sm font-medium">Cancel</span>
          </button>

          <button
            onClick={handleUseImage}
            disabled={isProcessing || !dataUrl}
            className="flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? "Processing..." : "Use image"}
          </button>
        </div>
      </div>
    </div>
  );
}
