"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button, Card } from "@heroui/react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (file: File, previewUrl: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  onUpload,
  accept = "image/png,image/jpeg,image/jpg",
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG or JPG)");
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onUpload(file, url);
    },
    [onUpload, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <div className="relative aspect-video w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-full object-contain bg-gray-900"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              onPress={handleClear}
              className="bg-background/80 backdrop-blur-sm"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-default-300 hover:border-default-400"
          }`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-4 p-4 rounded-full bg-default-100">
              <Upload size={32} className="text-default-500" />
            </div>
            <p className="text-center text-default-600 mb-2">
              <span className="font-semibold">Click to upload</span> or drag
              and drop
            </p>
            <p className="text-center text-sm text-default-400">
              PNG, JPG up to {maxSizeMB}MB
            </p>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-2 p-3 bg-danger-50 text-danger text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
