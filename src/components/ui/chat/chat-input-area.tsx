'use client';

import { Paperclip, ArrowDown, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput as BaseChatInput } from "./chat-input";
import { SendButton } from "./send-button";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { CameraCaptureDialog } from "./camera-capture-dialog";
import { ImageCropDialog } from "./image-crop-dialog";

// Dynamically import VoiceInput to avoid SSR issues
const VoiceInput = dynamic(() => import("@/components/VoiceInput"), { ssr: false });

interface ChatInputAreaProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export function ChatInputArea({
  input,
  isLoading,
  onSubmit,
  onKeyDown,
  onChange,
  selectedFile,
  onFileChange,
  onRemoveFile,
  showScrollToBottom = false,
  onScrollToBottom,
}: ChatInputAreaProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isImageCropDialogOpen, setIsImageCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const overlayDragCounterRef = useRef(0);

  const ACCEPTED_FILE_TYPES = useRef(new Set(["application/pdf"]));

  const isAcceptedFile = useCallback(
    (file: File) =>
      file.type.startsWith("image/") || ACCEPTED_FILE_TYPES.current.has(file.type),
    []
  );

  const extractFileFromFileList = useCallback(
    (list?: FileList | null): File | null => {
      if (!list || list.length === 0) return null;
      const files = Array.from(list);
      return files.find(isAcceptedFile) ?? null;
    },
    [isAcceptedFile]
  );

  const extractFileFromItems = useCallback(
    (items?: DataTransferItemList | null): File | null => {
      if (!items) return null;
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && isAcceptedFile(file)) {
            return file;
          }
        }
      }
      return null;
    },
    [isAcceptedFile]
  );

  const extractFileFromDataTransfer = useCallback(
    (dataTransfer?: DataTransfer | null): File | null => {
      if (!dataTransfer) return null;
      return (
        extractFileFromFileList(dataTransfer.files) ??
        extractFileFromItems(dataTransfer.items)
      );
    },
    [extractFileFromFileList, extractFileFromItems]
  );

  const handleIncomingFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!isAcceptedFile(file)) {
        setFileError("Only images or PDFs can be attached.");
        setIsDragActive(false);
        return;
      }

      setFileError(null);
      setIsDragActive(false);

      overlayDragCounterRef.current = 0;

      if (file.type.startsWith("image/")) {
        setImageToCrop(file);
        setIsImageCropDialogOpen(true);
      } else {
        onFileChange(file);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [isAcceptedFile, onFileChange]
  );

  const hasAcceptableFile = useCallback(
    (dataTransfer?: DataTransfer | null) => {
      if (!dataTransfer) return false;
      if (extractFileFromItems(dataTransfer.items)) return true;
      const files = Array.from(dataTransfer.files || []);
      return files.some(isAcceptedFile);
    },
    [extractFileFromItems, isAcceptedFile]
  );

  useEffect(() => {
    let objectUrl: string | null = null;

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }
      setFileError(null);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleIncomingFile(file);
  };

  // When voice input is complete, update the input field
  const handleVoiceTranscription = (text: string) => {
    if (text) {
      // If there's already typed input, add a space before the voice text
      const newValue = input ? input + " " + text : text;
      onChange({
        target: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = extractFileFromDataTransfer(event.clipboardData);
    if (file) {
      event.preventDefault();
      handleIncomingFile(file);
    }
  };

  const handleInputDragOver = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    [hasAcceptableFile]
  );

  const handleInputDrop = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      const file = extractFileFromDataTransfer(event.dataTransfer);
      handleIncomingFile(file ?? null);
    },
    [extractFileFromDataTransfer, handleIncomingFile, hasAcceptableFile]
  );

  useEffect(() => {
    const handleWindowDragEnter = (event: DragEvent) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      overlayDragCounterRef.current += 1;
      setIsDragActive(true);
    };

    const handleWindowDragLeave = (event: DragEvent) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      overlayDragCounterRef.current = Math.max(0, overlayDragCounterRef.current - 1);
      if (overlayDragCounterRef.current === 0) {
        setIsDragActive(false);
      }
    };

    const handleWindowDragOver = (event: DragEvent) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
    };

    const handleWindowDrop = (event: DragEvent) => {
      if (!hasAcceptableFile(event.dataTransfer)) return;
      event.preventDefault();
      overlayDragCounterRef.current = 0;
      setIsDragActive(false);
      const file = extractFileFromDataTransfer(event.dataTransfer);
      handleIncomingFile(file ?? null);
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [extractFileFromDataTransfer, handleIncomingFile, hasAcceptableFile]);

  return (
    <div className="p-2 md:p-4 bg-background relative">
      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80">
          <div className="pointer-events-none rounded-lg border-2 border-dashed border-primary/70 bg-background/90 px-6 py-4 text-sm font-medium text-primary">
            Drop image or PDF to attach
          </div>
        </div>
      )}
      {/* Scroll to Bottom Button */}
      {showScrollToBottom && onScrollToBottom && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <Button
            onClick={onScrollToBottom}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 dark:border-white/20 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-background/90 pointer-events-auto"
            size="icon"
            variant="outline"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className={cn(
            "relative flex flex-col gap-2",
            isDragActive && "rounded-lg border-2 border-dashed border-primary/70 bg-muted/60"
          )}
        >
          {isDragActive && (
            <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-primary/70 bg-background/80" />
          )}
          <div className="flex items-center gap-2">
            <BaseChatInput
              ref={inputRef}
              value={input}
              onKeyDown={onKeyDown}
              onChange={onChange}
              onPaste={handlePaste}
              onDragOver={handleInputDragOver}
              onDrop={handleInputDrop}
              placeholder="Ask anything..."
              className="min-h-[60px] md:min-h-[80px] resize-none rounded-lg bg-muted border-border p-3 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 mt-2">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="flex items-center gap-1 text-sm">
                  <span className="inline-block bg-gray-200 rounded p-1 text-xs">
                    {selectedFile.type.startsWith("image/") ? "IMG" : "PDF"}
                  </span>
                  <span>{selectedFile.name}</span>
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  onRemoveFile();
                  setFileError(null);
                }}
                aria-label="Remove file"
              >
                ✕
              </Button>
            </div>
          )}
          {fileError && (
            <p className="text-xs text-destructive">
              {fileError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 hover:opacity-80 transition-opacity text-foreground"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 hover:opacity-80 transition-opacity text-foreground"
                onClick={() => setIsCameraDialogOpen(true)}
                aria-label="Open camera"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <VoiceInput
                onTranscription={handleVoiceTranscription}
                disabled={isLoading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <SendButton
              input={input}
              isLoading={isLoading}
              onSubmit={onSubmit}
              formRef={formRef}
            />
          </div>
        </form>
      </div>
      <CameraCaptureDialog
        isOpen={isCameraDialogOpen}
        onClose={() => setIsCameraDialogOpen(false)}
        onCapture={(file: File) => {
          onFileChange(file);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setFileError(null);
          setIsCameraDialogOpen(false);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      />
      <ImageCropDialog
        isOpen={isImageCropDialogOpen}
        sourceFile={imageToCrop}
        onClose={() => {
          setIsImageCropDialogOpen(false);
          setImageToCrop(null);
        }}
        onCropComplete={(file) => {
          onFileChange(file);
          setFileError(null);
          setIsImageCropDialogOpen(false);
          setImageToCrop(null);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      />
    </div>
  );
}
