"use client";

import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getS3UploadParams,
  prepareUploadPart,
  updateLessonPdfKey,
  updateLessonVideoKey,
} from "@/actions/lessons";

type FileType = "pdf" | "video";

interface FileUploaderProps {
  type: FileType;
  onUploadComplete: (key: string, name: string) => void;
  lesson_id: string;
}

function createUppy(type: FileType) {
  const allowedFileTypes =
    type === "pdf"
      ? [".pdf", "application/pdf"]
      : [".mp4", ".mov", ".avi", ".webm", "video/*"];

  const uppy = new Uppy({
    restrictions: {
      maxNumberOfFiles: 1,
      maxTotalFileSize: 1000 * 1024 * 1024,
      allowedFileTypes,
    },
  });

  // @ts-ignore
  return uppy.use(AwsS3, {
    shouldUseMultipart(file) {
      // Use multipart only for files larger than 100MiB.
      if (!file?.size) return false;
      return file.size > 100 * 2 ** 20;
    },
    async createMultipartUpload(file) {
      const response = await createMultipartUpload(file.name ?? "", file.type);

      if (!response.uploadId) {
        throw new Error("Failed to get uploadId for multipart upload");
      }

      return { uploadId: response.uploadId, key: response.key };
    },
    async signPart(file, partData) {
      const { uploadId, key, partNumber } = partData;
      const result = await prepareUploadPart(key, uploadId, partNumber);
      return {
        url: result.url,
        method: "PUT",
      };
    },

    async completeMultipartUpload(file, { uploadId, key, parts }) {
      const validParts = parts.filter(
        (part): part is { ETag: string; PartNumber: number } =>
          part.ETag !== undefined
      );
      return await completeMultipartUpload(key, uploadId, validParts);
    },

    async abortMultipartUpload(file, { uploadId, key }) {
      await abortMultipartUpload(key, uploadId);
    },
    async getTemporarySecurityCredentials(options?: { signal?: AbortSignal }) {
      const response = await fetch("/sts-token", { signal: options?.signal });
      if (!response.ok)
        throw new Error("Failed to fetch STS", { cause: response });
      return response.json();
    },
    async getUploadParameters(fileObject: any) {
      const file = fileObject.data as File;

      const { url, fields } = await getS3UploadParams(
        file.name,
        file.type,
        file.size
      );

      if (!url || !fields) {
        throw new Error("Upload URL is undefined");
      }

      uppy.setFileMeta(fileObject.id, { fileKey: fields.key });

      return {
        url,
        method: "POST",
        fields,
      };
    },
  });
}
export function FileUploader({
  type,
  onUploadComplete,
  lesson_id,
}: FileUploaderProps) {
  const [uppy] = useState(() => createUppy(type));
  const toastIdRef = useRef<string | number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleUpload = () => {
      setIsUploading(true);
      toastIdRef.current = toast.loading(
        `Starting ${type === "pdf" ? "PDF" : "Video"} upload...`
      );
    };

    const handleComplete = async (result: any) => {
      const { successful = [] } = result;
      setIsUploading(false);

      if (successful.length === 0) return;

      const name = successful[0].name as string;
      const key = successful[0].meta.fileKey as string;

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }

      toast.success(
        `${type === "pdf" ? "PDF" : "Video"} ${name} uploaded successfully!`
      );

      if (type === "pdf") {
        await updateLessonPdfKey(lesson_id, key, name);
      } else {
        await updateLessonVideoKey(lesson_id, key, name);
      }
      onUploadComplete(key, name);
    };

    const handleProgress = debounce((progress: number) => {
      if (!isUploading) return;

      const progressMessage = `Uploading ${
        type === "pdf" ? "PDF" : "Video"
      }... ${progress}%`;

      if (toastIdRef.current) {
        toast.loading(progressMessage, {
          id: toastIdRef.current,
        });
      }
    }, 100);

    const handleError = (file: any, error: Error) => {
      setIsUploading(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toast.error(`Upload failed: ${error.message}`);
    };

    uppy.on("upload", handleUpload);
    uppy.on("complete", handleComplete);
    uppy.on("progress", handleProgress);
    uppy.on("upload-error", handleError);

    return () => {
      uppy.off("upload", handleUpload);
      uppy.off("complete", handleComplete);
      uppy.off("progress", handleProgress);
      uppy.off("upload-error", handleError);

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [uppy, type, lesson_id, isUploading, onUploadComplete]);

  return (
    <Dashboard
      uppy={uppy}
      proudlyDisplayPoweredByUppy={false}
      hidePauseResumeButton
      hideProgressAfterFinish
      singleFileFullScreen
      height="55vh"
      className="!h-[60vh] !w-full !border-none !shadow-none !p-0"
    />
  );
}

function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
