"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Download, Share2, RefreshCw, CheckCircle2, AlertCircle, XCircle, Clock, PlayCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import Link from "next/link";
import { api, MediaJobResponse, MediaJobStatusEnum, ArtifactData } from "@/lib/api";
import { getStatusColor, getStatusBadgeStyles, formatDate } from "../../utils";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<MediaJobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await api.mediaLab.getJob(id);
      setJob(response);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch job:", err);
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();

    // Poll for updates if job is active
    const intervalId = setInterval(() => {
      if (job && (job.status === MediaJobStatusEnum.QUEUED || job.status === MediaJobStatusEnum.RUNNING)) {
        fetchJob();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchJob, job?.status]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this job?")) return;
    
    try {
      setProcessingAction(true);
      await api.mediaLab.cancelJob(id);
      await fetchJob();
    } catch (err) {
      console.error("Failed to cancel job:", err);
      alert("Failed to cancel job");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRetry = async () => {
    try {
      setProcessingAction(true);
      await api.mediaLab.retryJob(id);
      await fetchJob();
    } catch (err) {
      console.error("Failed to retry job:", err);
      alert("Failed to retry job");
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-5xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
          <h2 className="text-2xl font-heading text-[var(--color-text-primary)] mb-2">Error Loading Job</h2>
          <p className="text-[var(--color-text-muted)] mb-6">{error || "Job not found"}</p>
          <Button onPress={() => router.push("/media-lab")} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Media Lab
          </Button>
        </div>
      </div>
    );
  }

  const mainArtifact = job.artifacts && job.artifacts.length > 0 ? job.artifacts[0] : null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link 
              href="/media-lab" 
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Media Lab
            </Link>
            <h1 className="text-3xl font-heading text-[var(--color-text-primary)]">
              Job Details
            </h1>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <span className="font-mono">{id}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
              <span className="capitalize">{job.workflow_type}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {job.status === MediaJobStatusEnum.RUNNING || job.status === MediaJobStatusEnum.QUEUED ? (
              <Button 
                className="text-red-500 hover:bg-red-500/10"
                variant="ghost" 
                onPress={handleCancel}
                isDisabled={processingAction}
              >
                {processingAction ? <Spinner size="sm" color="current" /> : <XCircle className="w-4 h-4 mr-2" />}
                Cancel Job
              </Button>
            ) : null}
            
            {mainArtifact && (
              <a 
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent-primary)] text-white hover:opacity-90 transition-opacity"
                href={mainArtifact.file_path}
                target="_blank"
                download
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Result
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-1 overflow-hidden">
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center group">
                {mainArtifact ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={mainArtifact.file_path} 
                    alt="Job Result" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-2 z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                    {job.status === MediaJobStatusEnum.SUCCEEDED ? (
                      <p className="text-[var(--color-text-muted)]">No preview available</p>
                    ) : (
                      <div className="flex flex-col items-center text-white">
                        <Spinner size="lg" color="current" className="mb-4 opacity-50" />
                        <p className="text-[var(--color-text-muted)]">Processing...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-heading mb-4">Status & Logs</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-[var(--color-text-muted)] space-y-2 h-48 overflow-y-auto">
                <p>[{formatDate(job.created_at)}] Job created</p>
                <p>[{formatDate(job.updated_at)}] Status: {job.status}</p>
                {job.progress > 0 && job.progress < 100 && (
                  <p className="text-blue-400">Progress: {job.progress}%</p>
                )}
                {job.error_message && (
                  <p className="text-red-400">Error: {job.error_message}</p>
                )}
                {job.status === MediaJobStatusEnum.SUCCEEDED && (
                  <p className="text-green-400">Job completed successfully</p>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Current Status</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    job.status === MediaJobStatusEnum.SUCCEEDED ? "bg-green-500/20 text-green-400" :
                    job.status === MediaJobStatusEnum.FAILED ? "bg-red-500/20 text-red-400" :
                    job.status === MediaJobStatusEnum.RUNNING ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {job.status === MediaJobStatusEnum.SUCCEEDED ? <CheckCircle2 className="w-5 h-5" /> :
                     job.status === MediaJobStatusEnum.FAILED ? <XCircle className="w-5 h-5" /> :
                     job.status === MediaJobStatusEnum.RUNNING ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)] capitalize">{job.status.toLowerCase()}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Updated {formatDate(job.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] block mb-1">Job ID</span>
                    <p className="text-sm text-[var(--color-text-primary)] font-mono bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border)] break-all">
                      {job.id}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] block mb-1">Character ID</span>
                    <p className="text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border)]">
                      {job.character_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-[var(--color-text-muted)] block">Type</span>
                      <span className="text-sm text-[var(--color-text-primary)] capitalize">{job.workflow_type}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--color-text-muted)] block">Progress</span>
                      <span className="text-sm text-[var(--color-text-primary)]">{job.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {(job.status === MediaJobStatusEnum.FAILED || job.status === MediaJobStatusEnum.CANCELLED || job.status === MediaJobStatusEnum.SUCCEEDED) && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onPress={handleRetry}
                    isDisabled={processingAction}
                  >
                    {processingAction ? <Spinner size="sm" color="current" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Rerun Job
                  </Button>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
