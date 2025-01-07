"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUploader } from "./file-uploader";

type UploadType = "Videos" | "PDF";

interface UploadDialogProps {
  id: string;
  type: UploadType;
  onFileUploaded: (key: string, name: string) => void;
}

export function UploadDialog({ id, type, onFileUploaded }: UploadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload {type}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%]">
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
          <DialogDescription>
            Drag and drop your {type} here or click to browse. Maximum file size
            is 500 MB only
          </DialogDescription>
        </DialogHeader>
        {type === "Videos" ? (
          <FileUploader
            type="video"
            onUploadComplete={onFileUploaded}
            lesson_id={id}
          />
        ) : (
          <FileUploader
            type="pdf"
            onUploadComplete={onFileUploaded}
            lesson_id={id}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
