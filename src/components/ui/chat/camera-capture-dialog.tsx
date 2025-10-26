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
import { Icons } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { clampPercentCrop, getCroppedBlob } from "./crop-utils";

type CameraCaptureDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

const DEFAULT_CROP: PercentCrop = {
  unit: "%",
  x: 10,
  y: 10,
  width: 80,
  height: 80,
};

export function CameraCaptureDialog({
  isOpen,
  onClose,
  onCapture,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<PercentCrop>(DEFAULT_CROP);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setCapturedImage(null);
    setCrop(DEFAULT_CROP);
    setCompletedCrop(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setError("Camera access is not supported in this environment.");
      return;
    }

    try {
      setIsInitializingCamera(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      streamRef.current = stream;
    } catch (err) {
      console.error("Failed to start camera", err);
      setError("We couldn't access your camera. Please check permissions and try again.");
    } finally {
      setIsInitializingCamera(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen) {
      resetState();
      void startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, resetState, startCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) {
      setError("Camera feed not ready yet. Please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Unable to capture image. Try again.");
      return;
    }

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const dataUrl = canvas.toDataURL("image/png");

    setCapturedImage(dataUrl);
    setCrop(DEFAULT_CROP);
    setCompletedCrop(null);
    stopCamera();
  }, [stopCamera]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setCrop(DEFAULT_CROP);
    setCompletedCrop(null);
    void startCamera();
  }, [startCamera]);

  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  }, []);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      stopCamera();
      void startCamera();
    }
  }, [facingMode, isOpen, capturedImage, startCamera, stopCamera]);

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

  const handleUsePhoto = useCallback(async () => {
    if (!capturedImage || !completedCrop) {
      setError("Please capture and crop the image before continuing.");
      return;
    }

    const image = imageRef.current;
    if (!image) {
      setError("Image failed to load. Please retake the photo.");
      return;
    }

    try {
      setIsProcessing(true);
      const blob = await getCroppedBlob(image, completedCrop);
      const file = new File([blob], `chat-photo-${Date.now()}.png`, {
        type: blob.type || "image/png",
      });

      onCapture(file);
      onClose();
      resetState();
    } catch (err) {
      console.error("Failed to process captured image", err);
      setError("Something went wrong while processing the photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, completedCrop, onCapture, onClose, resetState]);

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        resetState();
      }
    },
    [onClose, resetState]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Take a photo</DialogTitle>
          <DialogDescription>
            Capture an image using your camera and crop it before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
            {!capturedImage ? (
              <div className="relative aspect-[3/4] w-full bg-black">
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {isInitializingCamera && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
                    Initializing camera...
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4 text-center text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "relative flex aspect-square w-full items-center justify-center bg-black",
                  isProcessing && "pointer-events-none opacity-80"
                )}
              >
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={handleCropComplete}
                  className="max-h-full max-w-full"
                  ruleOfThirds
                  keepSelection
                >
                  {/* The cropping library requires a native img element for direct pixel access */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={capturedImage}
                    alt="Captured preview"
                    onLoad={handleImageLoad}
                    className="max-h-[70vh] w-auto"
                  />
                </ReactCrop>
              </div>
            )}
          </div>

          {capturedImage && (
            <p className="text-xs text-muted-foreground">
              Drag the handles on the crop box to resize it. Move the box to adjust the area you want to send.
            </p>
          )}

          {!capturedImage && !error && (
            <p className="text-xs text-muted-foreground">
              Tip: Position your document or object in good lighting, then tap capture.
            </p>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          {capturedImage ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                disabled={isProcessing}
              >
                Retake
              </Button>
              <Button
                type="button"
                onClick={handleUsePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Use photo"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleSwitchCamera}
                disabled={isInitializingCamera || !!error}
                className="mr-auto gap-2"
              >
                <Icons.SwitchCamera className="h-4 w-4" />
                <span>Switch</span>
              </Button>
              <Button
                type="button"
                onClick={handleCapture}
                disabled={isInitializingCamera || !!error}
              >
                Capture
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
