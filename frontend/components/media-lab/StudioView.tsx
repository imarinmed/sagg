"use client";

import React, { useState, useCallback, lazy, Suspense, useMemo } from "react";
import { Card, Button, Spinner } from "@heroui/react";
import { Download, Trash2, Eye } from "lucide-react";
import { api, ArtifactData } from "@/lib/api";
import { ParameterSidebar, GenerationParams } from "./ParameterSidebar";
import { PresetManager } from "./PresetManager";

// Code-split heavy components using dynamic imports
const BatchGrid = lazy(() =>
  import("./BatchGrid").then((module) => ({
    default: module.BatchGrid,
  }))
);
const TaggingPanel = lazy(() =>
  import("./TaggingPanel").then((module) => ({
    default: module.TaggingPanel,
  }))
);

import { TaggingPanelSkeleton, ArtifactGridSkeleton, PreviewSkeleton } from "./SkeletonLoaders";
import { ErrorBoundary } from "./ErrorBoundary";

// Type alias for artifact
type ImageArtifact = ArtifactData;

interface StudioViewProps {
  workflowType?: "generate" | "enhance";
}

export function StudioView({ workflowType = "generate" }: StudioViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [artifacts, setArtifacts] = useState<ImageArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pipelineConfig, setPipelineConfig] = useState<any>(null);

  const handleGenerate = useCallback(
    async (params: GenerationParams) => {
      setIsGenerating(true);
      setError(null);
      setArtifacts([]);

      try {
        // Build pipeline config from params
        const newConfig = {
          stages: [
            { stage_type: "text_to_image" },
            { stage_type: "refiner" },
          ],
          parameters: {
            width: params.width,
            height: params.height,
            steps: params.steps,
            guidance_scale: params.cfgScale,
          },
          sampler: params.sampler,
          scheduler: params.scheduler,
          seed: params.seed,
          batch_size: params.batchSize,
          loras: params.loras,
        };
        
        setPipelineConfig(newConfig);

        const inputData = {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt,
          instruction: params.instruction,
        };

        // Call API
        const response = await api.mediaLab.generate({
          pipeline_config: newConfig as any,
          input_data: inputData,
        });

        if (!response.success) {
          setError(response.error || "Generation failed");
          setIsGenerating(false);
          return;
        }

        // Convert artifact paths to ArtifactData objects
        const newArtifacts: ImageArtifact[] = (response.artifacts || []).map(
          (path: string, idx: number) => ({
            id: `artifact-${Date.now()}-${idx}`,
            artifact_type: "generated_image",
            file_path: path,
            file_size_bytes: null,
            metadata_json: { seed: params.seed + idx },
          })
        );

        setArtifacts(newArtifacts);
        if (newArtifacts.length > 0) {
          setSelectedArtifactId(newArtifacts[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to generate");
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const handleLoadPreset = useCallback((config: any) => {
    setPipelineConfig(config);
    // Could update UI state here if needed
  }, []);

  const handleDelete = useCallback((artifact: ImageArtifact) => {
    setArtifacts((prev) => prev.filter((a) => a.id !== artifact.id));
    if (selectedArtifactId === artifact.id) {
      setSelectedArtifactId(null);
    }
  }, [selectedArtifactId]);

  const handleDownload = useCallback((artifact: ImageArtifact) => {
    const link = document.createElement("a");
    link.href = artifact.file_path;
    link.download = `artifact-${artifact.id}.png`;
    link.click();
  }, []);

  const handleView = useCallback((artifact: ImageArtifact) => {
    setSelectedArtifactId(artifact.id);
  }, []);

  // Memoize selected artifact to prevent unnecessary rerenders of dependent components
  const selectedArtifact = useMemo(
    () => artifacts.find((a) => a.id === selectedArtifactId),
    [artifacts, selectedArtifactId]
  );

  return (
    <ErrorBoundary
      onError={(error, info) => {
        console.error('StudioView error:', error);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
        {/* Left Panel - Parameters & Presets */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          <Card className="p-4 transition-all duration-200 hover:shadow-lg">
            <PresetManager 
              currentConfig={pipelineConfig} 
              onLoadPreset={handleLoadPreset}
            />
          </Card>
          <Card className="p-4 flex-1 overflow-y-auto transition-all duration-200 hover:shadow-lg">
            <ParameterSidebar
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </Card>
        </div>

        {/* Center Panel - Live Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1 flex items-center justify-center min-h-[300px] bg-content1 p-4 transition-all duration-300">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <Spinner size="lg" />
                <p className="text-sm text-default-500">Generating {artifacts.length > 0 ? `${artifacts.length} images` : "..."}</p>
              </div>
            ) : selectedArtifact ? (
              <div className="w-full h-full flex items-center justify-center animate-in fade-in duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedArtifact.file_path}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <p className="text-center text-default-500">
                {error ? `Error: ${error}` : "Generate an image to see preview"}
              </p>
            )}
          </Card>
        </div>

        {/* Right Panel - Batch Grid */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
          {selectedArtifact && (
            <Suspense fallback={<TaggingPanelSkeleton />}>
              <TaggingPanel
                artifactId={selectedArtifact.id}
                initialTags={selectedArtifact.tags || {}}
                onTagsChanged={(tags) => {
                  // Update the selected artifact with new tags
                  setArtifacts((prev) =>
                    prev.map((a) =>
                      a.id === selectedArtifact.id ? { ...a, tags } : a
                    )
                  );
                }}
                isLoading={isGenerating}
              />
            </Suspense>
          )}
          
          {artifacts.length > 0 ? (
            <Suspense fallback={<ArtifactGridSkeleton />}>
              <BatchGrid
                artifacts={artifacts}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onView={handleView}
              />
            </Suspense>
          ) : (
            <Card className="p-4 text-center text-sm text-default-500">
              {isGenerating ? "Generating..." : "No artifacts yet"}
            </Card>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
