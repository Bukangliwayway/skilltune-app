// components/lessons/LessonForm.tsx
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
import { FileSectionProps, LessonFormProps } from "./lessons.types";

const FileSection = ({
  id,
  label,
  type,
  file,
  onUpload,
  onDelete,
  onDownload,
  isSubmitting,
}: FileSectionProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    if (file) {
      await onDelete(file.key);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <FormLabel>{label}</FormLabel>
        <UploadDialog id={id} type={type} onFileUploaded={onUpload} />
      </div>

      {file && file?.download_url != "" ? (
        <div className="relative">
          <div
            className="border rounded-md mt-4 p-4 cursor-pointer group"
            onClick={() => onDownload(file.download_url, file.filename)}
          >
            {/* Delete button */}
            <button
              className="absolute top-2 right-2 p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Filename */}
            <p className="mt-2 text-sm truncate">{file.filename}</p>
          </div>

          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete {type === "video" ? "Video" : "PDF"}
                </DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete {file.filename}?</p>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  type="button"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="border rounded-md mt-4 p-4 h-[64px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No Data Yet</p>
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
    await onDelete(Number(form.getValues("id")));
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

        <div className="grid grid-cols-2 gap-4">
          <FileSection
            id={form.getValues("id")}
            label="PDF Lesson"
            type="PDF"
            file={pdfFile}
            onUpload={onPDFUpload}
            onDelete={onPDFDelete}
            onDownload={onFileDownload}
            isSubmitting={isSubmitting}
          />

          <FileSection
            id={form.getValues("id")}
            label="Video Lesson"
            type="video"
            file={videoFile}
            onUpload={onVideoUpload}
            onDelete={onVideoDelete}
            onDownload={onFileDownload}
            isSubmitting={isSubmitting}
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
