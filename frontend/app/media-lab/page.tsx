"use client";

import { useState, useEffect } from "react";
import { Button, Input, Spinner, Slider } from "@heroui/react";
import { Search, Wand2, Sparkles, Layers, Shuffle, History, Play, RefreshCw, AlertCircle, UploadCloud } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import Link from "next/link";
import { api, MediaJobResponse, MediaJobStatusEnum, MediaCapabilitiesResponse } from "@/lib/api";
import { getStatusColor, getStatusBadgeStyles, formatDate } from "./utils";

function getMediaLabArtifactUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.replace(/^\/+/, "");
  return `/static/media-lab/${normalized}`;
}

export default function MediaLabPage() {
  const [activeTab, setActiveTab] = useState<"generate" | "enhance" | "interpolate" | "blend" | "jobs">("generate");

  return (
    <div className="space-y-0">
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden -mt-24 sm:-mt-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0a0a0f 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-transparent to-[#0a0a0f]/70" />
          
          <div className="absolute top-20 right-20 w-64 h-64 border border-blue-500/10 rounded-full opacity-30" />
          <div className="absolute top-32 right-32 w-48 h-48 border border-purple-500/20 rounded-full opacity-20" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-8 md:p-12 lg:p-16 pt-32">
          <div className="max-w-4xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-blue-900/30 text-blue-400 border border-blue-500/50 rounded-full">
              <Wand2 className="w-3 h-3" />
              Beta
            </span>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white leading-tight drop-shadow-2xl">
              Media Lab
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
              Generate, enhance, and manipulate media assets using advanced AI models.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
      </div>

      <div className="sticky top-20 z-30 px-4 md:px-8 lg:px-16 py-4 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
          <TabButton 
            id="generate" 
            label="Generate" 
            icon={<Wand2 className="w-4 h-4" />} 
            active={activeTab === "generate"} 
            onClick={() => setActiveTab("generate")} 
          />
          <TabButton 
            id="enhance" 
            label="Enhance" 
            icon={<Sparkles className="w-4 h-4" />} 
            active={activeTab === "enhance"} 
            onClick={() => setActiveTab("enhance")} 
          />
          <TabButton 
            id="interpolate" 
            label="Interpolate" 
            icon={<Layers className="w-4 h-4" />} 
            active={activeTab === "interpolate"} 
            onClick={() => setActiveTab("interpolate")} 
          />
          <TabButton 
            id="blend" 
            label="Blend" 
            icon={<Shuffle className="w-4 h-4" />} 
            active={activeTab === "blend"} 
            onClick={() => setActiveTab("blend")} 
          />
          <div className="w-px h-8 bg-[var(--color-border)] mx-2 self-center hidden md:block" />
          <TabButton 
            id="jobs" 
            label="Job History" 
            icon={<History className="w-4 h-4" />} 
            active={activeTab === "jobs"} 
            onClick={() => setActiveTab("jobs")} 
          />
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-16 py-8 min-h-[500px]">
        <div className="max-w-7xl mx-auto">
          {activeTab === "generate" && <GenerateView />}
          {activeTab === "enhance" && <EnhanceView />}
          {activeTab === "interpolate" && <InterpolateView />}
          {activeTab === "blend" && <BlendView />}
          {activeTab === "jobs" && <JobsView />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  id, 
  label, 
  icon, 
  active, 
  onClick 
}: { 
  id: string; 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
        ${active 
          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function GenerateView() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState("stable-diffusion-3");
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingError, setGeneratingError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "failed" | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Load available models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await api.mediaLab.listModels("text-to-image");
        if (response.models) {
          setModels(response.models.map(m => ({ id: m.id, name: m.name })));
        }
      } catch (err) {
        console.error("Failed to load models:", err);
        // Fallback to default models
        setModels([
          { id: "stable-diffusion-3", name: "Stable Diffusion 3" },
          { id: "flux-pro", name: "Flux Pro" },
        ]);
      }
    };
    loadModels();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  // Poll for job status
  const pollJobStatus = async (currentJobId: string) => {
    try {
      const job = await api.mediaLab.getJob(currentJobId);
      setJobStatus(job.status as any);
      
      // Update progress based on stage
      if (job.status === "completed") {
        setProgress(100);
        setLoading(false);
        if (pollInterval) clearInterval(pollInterval);
        
        // Get artifacts
        const artifacts = await api.mediaLab.getArtifacts(currentJobId);
        if (artifacts.artifacts && artifacts.artifacts.length > 0) {
          setGeneratedImage(getMediaLabArtifactUrl(artifacts.artifacts[0].file_path));
        }
      } else if (job.status === "failed") {
        setLoading(false);
        setGeneratingError("Generation failed. Please try again.");
        if (pollInterval) clearInterval(pollInterval);
      }
    } catch (err) {
      console.error("Error polling job status:", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setGeneratingError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setGeneratingError(null);
    setGeneratedImage(null);
    setProgress(10);

    try {
      // Create pipeline config for text-to-image generation
      const request: any = {
        pipeline_config: {
          stages: ["txt2img", "refiner"],
          parameters: {
            model_id: selectedModel,
            width: 512,
            height: 512,
          },
        },
        input_data: {
          prompt: prompt,
          negative_prompt: negativePrompt,
          seed: seed || Math.floor(Math.random() * 1000000),
          guidance_scale: 7.5,
          num_inference_steps: 20,
        },
      };

      const response = await api.mediaLab.generate(request);
      
      if (!response.success) {
        setGeneratingError(response.error || "Generation failed");
        setLoading(false);
        return;
      }

      setJobId(response.job_id);
      setJobStatus("running");
      setProgress(30);

      // Start polling for status
      const interval = setInterval(() => pollJobStatus(response.job_id), 2000);
      setPollInterval(interval);
    } catch (err: any) {
      console.error("Generation error:", err);
      setGeneratingError(err.message || "Failed to start generation");
      setLoading(false);
    }
  };

  const randomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-lg font-heading text-[var(--color-text-primary)]">Generation Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-muted)]">Prompt</label>
              <textarea 
                className="w-full h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-muted)]">Negative Prompt</label>
              <Input 
                placeholder="What to avoid..." 
                className="bg-[var(--color-surface)] border-[var(--color-border)]"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-muted)]">Model</label>
              <select 
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[var(--color-text-muted)]">Seed</label>
                <button 
                  onClick={randomSeed}
                  disabled={loading}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  Randomize
                </button>
              </div>
              <Input 
                placeholder="Leave empty for random..." 
                className="bg-[var(--color-surface)] border-[var(--color-border)]"
                type="number"
                value={seed ?? ""}
                onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading}
              />
            </div>
            {generatingError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{generatingError}</p>
              </div>
            )}
            <Button 
              className="w-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              onClick={handleGenerate}
              isDisabled={loading || !prompt.trim()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Generating... ({progress}%)
                </div>
              ) : (
                "Generate Image"
              )}
            </Button>
          </div>
        </GlassCard>
      </div>
      <div className="lg:col-span-2">
        {generatedImage ? (
          <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--color-border)] flex flex-col">
            <img 
              src={generatedImage} 
              alt="Generated result" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-full min-h-[400px] border-2 border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)]/30">
            {loading && jobId ? (
              <>
                <Spinner size="lg" className="mb-4" />
                <p className="text-center">Generating your image...</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">Job ID: {jobId.slice(0, 8)}</p>
                <div className="w-full px-8 mt-4">
                  <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Wand2 className="w-12 h-12 mb-4 opacity-50" />
                <p>Generated results will appear here</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EnhanceView() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceAspectRatio, setSourceAspectRatio] = useState(1);
  const [qualityPreset, setQualityPreset] = useState<"low" | "medium" | "high">("medium");
  const [faceStrength, setFaceStrength] = useState(0.4);
  const [handStrength, setHandStrength] = useState(0.4);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOverPreview, setIsDragOverPreview] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<MediaJobStatusEnum | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [enhancedArtifact, setEnhancedArtifact] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [capabilities, setCapabilities] = useState<MediaCapabilitiesResponse | null>(null);
  const [checkingCapabilities, setCheckingCapabilities] = useState(true);

  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const caps = await api.mediaLab.getCapabilities();
        setCapabilities(caps);
      } catch (err) {
        console.error("Failed to check capabilities:", err);
      } finally {
        setCheckingCapabilities(false);
      }
    };
    checkCapabilities();
  }, []);

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const applySourceImage = (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSubmitError("Unsupported image format. Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setSubmitError("Image exceeds 50MB limit.");
      return;
    }

    setSourceImage(file);
    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;

      setSourcePreview(result);
      const image = new Image();
      image.onload = () => {
        if (image.width > 0 && image.height > 0) {
          setSourceAspectRatio(image.width / image.height);
        }
      };
      image.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    applySourceImage(e.target.files?.[0] ?? null);
  };

  const handlePreviewDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOverPreview(true);
  };

  const handlePreviewDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOverPreview(false);
  };

  const handlePreviewDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOverPreview(false);
    applySourceImage(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    if (capabilities && !capabilities.enhance_supported) {
      setSubmitError(capabilities.reason || "Enhancement is currently unavailable.");
      return;
    }

    if (!sourceImage || !sourcePreview) {
      setSubmitError("Please select an image first");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const upload = await api.mediaLab.uploadImage(sourceImage);
      const response = await api.mediaLab.submitJob({
        character_id: "media-lab",
        workflow_type: "enhance",
        parameters: {
          source_image_path: upload.stored_path,
          quality_preset: qualityPreset,
          face_strength: faceStrength,
          hand_strength: handStrength,
          workflow_stack: {
            orchestrator: "daggr",
            model: "z-image-turbo",
          },
          quality_prompt:
            "photorealistic, crisp focus, clean details, accurate colors",
        },
      });
      
      if (pollInterval) {
        clearInterval(pollInterval);
      }

      setJobId(response.id);
      setJobStatus(response.status as MediaJobStatusEnum);
      setJobProgress(response.progress || 0);

      // Start polling for job completion
      const interval = setInterval(async () => {
        try {
          const jobData = await api.mediaLab.getJob(response.id);
          const nextStatus = jobData.status as MediaJobStatusEnum;
          setJobStatus(nextStatus);
          setJobProgress(jobData.progress || 0);

          if (nextStatus === MediaJobStatusEnum.SUCCEEDED) {
            if (jobData.artifacts && jobData.artifacts.length > 0) {
              setEnhancedArtifact(jobData.artifacts[0].file_path);
            }
            clearInterval(interval);
            setPollInterval(null);
          } else if (nextStatus === MediaJobStatusEnum.FAILED) {
            setSubmitError(jobData.error_message || "Job failed");
            clearInterval(interval);
            setPollInterval(null);
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 1000);

      setPollInterval(interval);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit job";
      if (errorMsg.toLowerCase().includes("failed to fetch")) {
        setSubmitError(
          "Could not reach Media Lab API. Check backend is running and /api proxy routing is active."
        );
      } else {
        setSubmitError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSourceImage(null);
    setSourcePreview(null);
    setQualityPreset("medium");
    setFaceStrength(0.4);
    setHandStrength(0.4);
    setJobId(null);
    setJobStatus(null);
    setJobProgress(0);
    setEnhancedArtifact(null);
    setSliderPosition(50);
    setSourceAspectRatio(1);
    setIsDragOverPreview(false);
    setSubmitError(null);
    if (pollInterval) clearInterval(pollInterval);
    setPollInterval(null);
  };

  // Show before/after comparison if job succeeded
  if (jobStatus === "SUCCEEDED" && sourcePreview && enhancedArtifact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-heading text-[var(--color-text-primary)]">Enhancement Complete</h3>
          <Button 
            size="sm" 
            variant="ghost" 
            onPress={resetForm}
          >
            New Enhancement
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before/After Comparison Slider */}
          <div className="space-y-4">
            <h4 className="font-heading text-[var(--color-text-primary)]">Before/After Comparison</h4>
            <div
              className="relative w-full max-h-[70vh] bg-[var(--color-surface)] rounded-lg overflow-hidden border border-[var(--color-border)]"
              style={{ aspectRatio: sourceAspectRatio }}
            >
              {/* Before image (full) */}
              <img 
                src={sourcePreview} 
                alt="Original" 
                className="absolute inset-0 w-full h-full object-contain"
              />
              
              {/* After image (clipped by slider) */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img 
                  src={getMediaLabArtifactUrl(enhancedArtifact)}
                  alt="Enhanced" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              {/* Slider handle */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-10"
                style={{ cursor: "col-resize" }}
              />

              {/* Visual slider line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-blue-400 pointer-events-none"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              />

              {/* Labels */}
              <div className="absolute bottom-4 left-4 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
                Original
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
                Enhanced
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-6">
            <GlassCard className="p-6 space-y-4">
              <h4 className="font-heading text-[var(--color-text-primary)]">Job Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Job ID</span>
                  <code className="text-xs bg-[var(--color-surface)] px-2 py-1 rounded font-mono text-blue-400">
                    {jobId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Status</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                    SUCCEEDED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Quality Preset</span>
                  <span className="capitalize font-medium text-[var(--color-text-primary)]">{qualityPreset}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Source Format</span>
                  <span className="uppercase font-mono text-xs text-[var(--color-text-primary)]">
                    {sourceImage?.name.split(".").pop()}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <h4 className="font-heading text-[var(--color-text-primary)]">Download</h4>
              <Button 
                className="w-full bg-blue-600 text-white font-medium"
                onPress={() => {
                  const link = document.createElement("a");
                  link.href = getMediaLabArtifactUrl(enhancedArtifact);
                  link.download = `enhanced-${Date.now()}.jpg`;
                  link.click();
                }}
              >
                Download Enhanced Image
              </Button>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // Show job progress if running
  if (jobStatus && jobStatus !== "SUCCEEDED") {
    return (
      <div className="space-y-6">
        <GlassCard className="p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="font-heading text-[var(--color-text-primary)]">Processing Enhancement</h4>
            <p className="text-sm text-[var(--color-text-muted)]">Job ID: {jobId}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Progress</span>
              <span className="font-medium text-[var(--color-text-primary)]">{jobProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${jobProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[var(--color-surface)]/50 rounded-lg">
            <Spinner size="sm" color="accent" />
            <span className="text-sm text-[var(--color-text-muted)]">
              {jobStatus === "QUEUED" && "Waiting to process..."}
              {jobStatus === "RUNNING" && "Enhancing your image..."}
              {jobStatus === "FAILED" && "Enhancement failed"}
            </span>
          </div>

          {jobStatus === "FAILED" && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {submitError || "Enhancement failed. Please try again."}
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  // Show upload form
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-lg font-heading text-[var(--color-text-primary)]">Enhancement Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-muted)]">Quality Preset</label>
              <select 
                value={qualityPreset}
                onChange={(e) => setQualityPreset(e.target.value as "low" | "medium" | "high")}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="low">Low (Fast, less detail)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Slow, maximum detail)</option>
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-[var(--color-text-muted)]">Face Detail Strength</label>
                  <span className="text-xs text-[var(--color-text-muted)]">{faceStrength.toFixed(2)}</span>
                </div>
                <Slider 
                  step={0.05} 
                  maxValue={1} 
                  minValue={0} 
                  defaultValue={0.4}
                  value={faceStrength} 
                  onChange={(v) => setFaceStrength(Array.isArray(v) ? v[0] : v)}
                  className="max-w-md"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-[var(--color-text-muted)]">Hand Detail Strength</label>
                  <span className="text-xs text-[var(--color-text-muted)]">{handStrength.toFixed(2)}</span>
                </div>
                <Slider 
                  step={0.05} 
                  maxValue={1} 
                  minValue={0} 
                  defaultValue={0.4}
                  value={handStrength} 
                  onChange={(v) => setHandStrength(Array.isArray(v) ? v[0] : v)}
                  className="max-w-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-muted)]">Source Image</label>
              <input 
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="block w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
              />
              <p className="text-xs text-[var(--color-text-muted)]">JPG, PNG, or WebP (max 50MB)</p>
            </div>

            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {capabilities && !capabilities.enhance_supported && !submitError && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{capabilities.reason || "Enhancement is currently unavailable."}</span>
              </div>
            )}

            <Button 
              className="w-full bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onPress={handleSubmit}
              isDisabled={!sourceImage || submitting || (capabilities ? !capabilities.enhance_supported : false)}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" color="current" />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance Image
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 text-sm">
          <h4 className="font-heading text-[var(--color-text-primary)]">How it works</h4>
          <ol className="space-y-2 text-[var(--color-text-muted)] list-decimal list-inside">
            <li>Upload a source image</li>
            <li>Choose quality preset</li>
            <li>Submit for enhancement</li>
            <li>View before/after comparison</li>
            <li>Download enhanced result</li>
          </ol>
        </GlassCard>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <h4 className="font-heading text-[var(--color-text-primary)]">Source Preview</h4>
          <div
            className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300 ${
              isDragOverPreview
                ? "border-cyan-300 bg-cyan-500/15 shadow-[0_0_0_3px_rgba(103,232,249,0.18),0_0_35px_rgba(59,130,246,0.2)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/30"
            }`}
            style={sourcePreview ? { aspectRatio: sourceAspectRatio } : undefined}
            onDragOver={handlePreviewDragOver}
            onDragLeave={handlePreviewDragLeave}
            onDrop={handlePreviewDrop}
          >
            {sourcePreview ? (
              <div className="relative min-h-[360px] max-h-[70vh] flex items-center justify-center">
                <img
                  src={sourcePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />

                <div
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                    isDragOverPreview ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent backdrop-blur-[1px]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/70 bg-black/65 px-6 py-2 text-cyan-100 shadow-lg shadow-cyan-500/20 animate-pulse">
                      <UploadCloud className="h-4 w-4" />
                      <span className="text-sm font-semibold tracking-wide">Drop to replace image</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center px-6 text-center text-[var(--color-text-muted)]">
                <UploadCloud className="w-12 h-12 mb-4 opacity-70" />
                <p>Drag and drop an image here</p>
                <p className="text-sm opacity-70 mt-1">Or choose a file from the left panel</p>
                <p className="text-xs opacity-60 mt-1">JPG, PNG, or WebP (max 50MB)</p>
              </div>
            )}

            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                isDragOverPreview ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/60 px-5 py-2 text-white shadow-xl">
                  <UploadCloud className="h-4 w-4" />
                  <span className="text-sm font-medium">Drop to upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterpolateView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
      <Layers className="w-16 h-16 mb-6 opacity-20" />
      <h3 className="text-xl font-heading mb-2">Frame Interpolation</h3>
      <p className="max-w-md text-center">Generate smooth transitions between keyframes to create fluid animations.</p>
    </div>
  );
}

function BlendView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
      <Shuffle className="w-16 h-16 mb-6 opacity-20" />
      <h3 className="text-xl font-heading mb-2">Style Blending</h3>
      <p className="max-w-md text-center">Merge concepts and styles from multiple sources into a cohesive new asset.</p>
    </div>
  );
}

function JobsView() {
  const [jobs, setJobs] = useState<MediaJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      setRefreshing(true);
      const response = await api.mediaLab.listJobs();
      setJobs(response.jobs);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Poll for updates every 10 seconds
    const intervalId = setInterval(() => {
      // Only poll if we're not already refreshing manually
      if (!refreshing) {
        api.mediaLab.listJobs().then(response => {
          setJobs(response.jobs);
        }).catch(err => console.error("Polling error:", err));
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
        <Spinner size="lg" color="accent" />
        <p className="mt-4">Loading job history...</p>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <p>{error}</p>
        <Button 
          variant="ghost" 
          className="mt-4" 
          onPress={fetchJobs}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-heading text-[var(--color-text-primary)]">Recent Jobs</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onPress={fetchJobs}
          isDisabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]/30 text-[var(--color-text-muted)]">
          <History className="w-12 h-12 mb-4 opacity-30" />
          <p>No jobs found</p>
          <p className="text-sm opacity-70 mt-1">Start a new generation task to see it here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/media-lab/jobs/${job.id}`}>
              <GlassCard className="p-4 hover:bg-[var(--color-surface-hover)] transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] group-hover:text-blue-400 transition-colors capitalize">
                        {job.workflow_type} Task
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">ID: {job.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--color-text-muted)] hidden sm:inline-block">
                      {formatDate(job.created_at)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeStyles(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
