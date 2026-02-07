"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button, Slider, Card } from "@heroui/react";
import { Brush, Eraser, Trash2 } from "lucide-react";

interface MaskPainterProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string) => void;
  width?: number;
  height?: number;
}

export function MaskPainter({
  imageUrl,
  onMaskChange,
  width = 512,
  height = 512,
}: MaskPainterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [opacity, setOpacity] = useState(1);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  // Load background image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  // Export mask when canvas changes
  const exportMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for the mask
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    // Fill with black (background)
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, width, height);

    // Get canvas data and extract white strokes
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const maskData = maskCtx.getImageData(0, 0, width, height);

    // Copy alpha channel as white where drawn
    for (let i = 0; i < imageData.data.length; i += 4) {
      const alpha = imageData.data[i + 3];
      if (alpha > 0) {
        maskData.data[i] = 255; // R
        maskData.data[i + 1] = 255; // G
        maskData.data[i + 2] = 255; // B
        maskData.data[i + 3] = 255; // A
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
    onMaskChange(maskCanvas.toDataURL("image/png"));
  }, [onMaskChange, width, height]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    exportMask();
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and redraw image
    ctx.clearRect(0, 0, width, height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      exportMask();
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tool Selection */}
          <div className="flex gap-2">
            <Button
              variant={tool === "brush" ? "primary" : "ghost"}
              onPress={() => setTool("brush")}
            >
              <Brush size={16} />
              Brush
            </Button>
            <Button
              variant={tool === "eraser" ? "primary" : "ghost"}
              onPress={() => setTool("eraser")}
            >
              <Eraser size={16} />
              Eraser
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <span className="text-sm">Size:</span>
            <Slider
              value={brushSize}
              onChange={(val) => setBrushSize(Array.isArray(val) ? val[0] : val)}
              minValue={1}
              maxValue={100}
              step={1}
              className="w-32"
            />
            <span className="text-sm w-8">{brushSize}px</span>
          </div>

          {/* Opacity */}
          {tool === "brush" && (
            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <span className="text-sm">Opacity:</span>
              <Slider
                value={opacity}
                onChange={(val) => setOpacity(Array.isArray(val) ? val[0] : val)}
                minValue={0.1}
                maxValue={1}
                step={0.1}
                className="w-32"
              />
              <span className="text-sm w-8">{Math.round(opacity * 100)}%</span>
            </div>
          )}

          {/* Clear Button */}
          <Button variant="danger" onPress={clearMask}>
            <Trash2 size={16} />
            Clear
          </Button>
        </div>
      </Card>

      {/* Canvas */}
      <div className="relative border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair max-w-full h-auto"
          style={{ touchAction: "none" }}
        />
      </div>

      <p className="text-sm text-default-500">
        Paint white areas to mask. The mask will be used for selective editing.
      </p>
    </div>
  );
}
