'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { PercentCrop, PixelCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Icons } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { clampPercentCrop, getCroppedBlob } from "./crop-utils";
import { X, RotateCcw } from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {!capturedImage ? (
        // Camera view
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {isInitializingCamera && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="mb-2 text-sm">Initializing camera...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
              <div className="text-center">
                <p className="mb-4 text-sm text-red-400">{error}</p>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Top controls */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              disabled={isInitializingCamera}
            >
              <X size={24} />
            </button>

            <button
              onClick={handleSwitchCamera}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors",
                isInitializingCamera && "opacity-50 cursor-not-allowed"
              )}
              disabled={isInitializingCamera || !!error}
            >
              <Icons.SwitchCamera className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom capture button */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8">
            <button
              onClick={handleCapture}
              disabled={isInitializingCamera || !!error}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="h-14 w-14 rounded-full bg-white" />
            </button>
          </div>
        </div>
      ) : (
        // Crop view
        <div className={cn("relative h-full w-full overflow-auto bg-black", isProcessing && "pointer-events-none opacity-80")}>
          {/* Header with close button */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>

            <span className="text-sm font-medium text-white">Crop photo</span>

            <div className="w-10" />
          </div>

          {/* Crop area */}
          <div className="flex h-full w-full items-center justify-center p-4">
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
                src={capturedImage}
                alt="Captured preview"
                onLoad={handleImageLoad}
                className="max-h-full w-auto object-contain"
              />
            </ReactCrop>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 py-6">
            <button
              onClick={handleRetake}
              className="flex h-12 items-center gap-2 rounded-lg bg-white/10 px-4 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              <RotateCcw size={20} />
              <span className="text-sm font-medium">Retake</span>
            </button>

            <button
              onClick={handleUsePhoto}
              disabled={isProcessing}
              className="flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? "Processing..." : "Use photo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
