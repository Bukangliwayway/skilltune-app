// components/lessons/LessonForm.tsx
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { UploadDialog } from "./uploader/upload-dialog";

interface FileItem {
  key: string;
  filename: string;
}

interface LessonFormData {
  title: string;
  sequence: number;
  description: string;
}

interface LessonFormProps {
  form: UseFormReturn<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onVideoUpload: (key: string, name: string) => void;
  onPDFUpload: (key: string, name: string) => void;
  onVideoDelete: (key: string) => Promise<void>;
  onPDFDelete: (key: string) => Promise<void>;
  onFileDownload: (url: string, filename: string) => void;
  pdfFile: FileItem | null;
  videoFile: FileItem | null;
  isSubmitting: boolean;
}

interface FileSectionProps {
  label: string;
  type: "PDF" | "Videos";
  file: FileItem | null;
  onUpload: (key: string, name: string) => void;
  onDelete: (key: string) => Promise<void>;
  onDownload: (url: string, filename: string) => void;
}

const FileSection = ({
  label,
  type,
  file,
  onUpload,
  onDelete,
  onDownload,
}: FileSectionProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    if (file) {
      await onDelete(file.key);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <FormLabel>{label}</FormLabel>
        <UploadDialog type={type} onFileUploaded={onUpload} />
      </div>

      {file && (
        <div className="relative">
          <div
            className="border rounded-md p-4 cursor-pointer group"
            onClick={() => onDownload(`/api/files/${file.key}`, file.filename)}
          >
            {/* Placeholder box for file preview */}
            <div className="w-full aspect-video bg-muted rounded-sm flex items-center justify-center">
              {type === "Videos" ? "Video Thumbnail" : "PDF Preview"}
            </div>

            {/* Delete button */}
            <button
              className="absolute top-2 right-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Filename */}
            <p className="mt-2 text-sm text-muted-foreground truncate">
              {file.filename}
            </p>
          </div>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete {type === "Videos" ? "Video" : "PDF"}
                </DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete {file.filename}?</p>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  type="button"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export function LessonForm({
  form,
  onSubmit,
  onDelete,
  onVideoUpload,
  onPDFUpload,
  onVideoDelete,
  onPDFDelete,
  onFileDownload,
  pdfFile,
  videoFile,
  isSubmitting,
}: LessonFormProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete(1); // You'll need to pass the actual ID here
    setIsDeleteModalOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Left Section */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-[3]">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sequence"
            render={({ field: { onChange, ...field } }) => (
              <FormItem className="flex-1">
                <FormLabel>Sequence</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      onChange(isNaN(value) ? "" : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2"
                  disabled={isSubmitting}
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Right Section */}
        <div className="space-y-6">
          <FileSection
            label="PDF Lesson"
            type="PDF"
            file={pdfFile}
            onUpload={onPDFUpload}
            onDelete={onPDFDelete}
            onDownload={onFileDownload}
          />

          <FileSection
            label="Video Lesson"
            type="Videos"
            file={videoFile}
            onUpload={onVideoUpload}
            onDelete={onVideoDelete}
            onDownload={onFileDownload}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button disabled={isSubmitting} type="submit" className="w-1/2">
            Update
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="w-1/2"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>

        {/* Delete Lesson Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Lesson</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {form.getValues("title")}?</p>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
