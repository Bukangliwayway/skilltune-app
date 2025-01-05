"use client";

import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  getS3UploadParams,
  prepareUploadPart,
} from "@/actions/lessons";

type FileType = "pdf" | "video";

interface FileUploaderProps {
  type: FileType;
  onUploadComplete: (key: string, name: string) => void;
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

export function FileUploader({ type, onUploadComplete }: FileUploaderProps) {
  const [uppy] = useState(() => createUppy(type));
  const toastIdRef = useRef<string | number | null>(null);

  uppy.on("complete", async (result) => {
    const { successful = [] } = result;

    const name = successful[0].name as string;
    const key = successful[0].meta.fileKey as string;

    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    toast.success(
      `${type === "pdf" ? "PDF" : "Video"} ${name} uploaded successfully!`
    );
    onUploadComplete(key, name);
  });

  uppy.on("progress", (progress) => {
    const progressMessage = `Uploading ${
      type === "pdf" ? "PDF" : "Video"
    }... progress: ${progress}/100%`;

    if (!toastIdRef.current) {
      toastIdRef.current = toast.loading(progressMessage);
    } else {
      toast.loading(progressMessage, {
        id: toastIdRef.current,
      });
    }
  });

  return <Dashboard uppy={uppy} />;
}
