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

type UploadType = "video" | "PDF";

interface UploadDialogProps {
  id: string;
  type: UploadType;
  onFileUploaded: (key: string, name: string, download_url: string) => void;
}

export function UploadDialog({ id, type, onFileUploaded }: UploadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="border" variant={"ghost"}>
          Upload {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%]">
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
          <DialogDescription>
            Drag and drop your {type} here or click to browse. Maximum file
            size. is 500 MB only. Note that uploading new {type} will replace
            the existing {type}.
          </DialogDescription>
        </DialogHeader>
        {type === "video" ? (
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
