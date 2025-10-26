'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { PercentCrop, PixelCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clampPercentCrop, getCroppedBlob } from "./crop-utils";

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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Adjust the selection to choose what you want to send.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {!dataUrl ? (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {error ?? "Preparing image..."}
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
                  className="max-h-[70vh] w-auto"
                />
              </ReactCrop>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {!error && (
            <p className="text-xs text-muted-foreground">
              Drag the handles on the crop box to resize it. The cropped image will replace the original upload.
            </p>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUseImage} disabled={isProcessing || !dataUrl}>
            {isProcessing ? "Processing..." : "Use image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
