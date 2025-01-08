"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { LessonForm } from "../LessonForm";
import { LoadingOverlay } from "@/components/loadingOverlay";
import { deleteAsset, deleteLesson, updateLesson } from "@/actions/lessons";
import { toast } from "sonner";
import {
  FileItem,
  LessonFormData,
  LessonPageComponentProps,
} from "../lessons.types";
import { SquarePen } from "lucide-react";

export default function UpdateLessonPageComponent({
  initialData,
}: LessonPageComponentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<FileItem | null>(null);
  const [videoFile, setVideoFile] = useState<FileItem | null>(null);

  const form = useForm<LessonFormData>({
    defaultValues: initialData || {
      title: "",
      sequence: 1,
      description: "",
      id: "",
    },
  });

  // File Upload Handlers
  const handleVideoUploaded = (key: string, name: string) => {
    setVideoFile({ key, filename: name });
  };

  const handlePDFUploaded = (key: string, name: string) => {
    setPdfFile({ key, filename: name });
  };

  // File Delete Handlers
  const handleVideoDelete = async (key: string) => {
    try {
      setIsLoading(true);
      await deleteAsset(key);
      setVideoFile(null);
    } catch (error) {
      console.error("Error deleting video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFDelete = async (key: string) => {
    try {
      setIsLoading(true);
      await deleteAsset(key);
      setPdfFile(null);
    } catch (error) {
      console.error("Error deleting PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit Handler
  const onSubmit = async (data: LessonFormData) => {
    let pdfKey: string = "",
      videoKey: string = "";

    try {
      setIsLoading(true);
      const res = await updateLesson({
        title: data.title,
        description: data.description,
        sequence: Number(data.sequence),
        id: data.id,
      });

      router.push(`/admin/lessons/${res.id}`); // Replace refresh with push
      toast.success("Lesson updated successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting lesson");
    } finally {
      setIsLoading(false);
    }
  };

  // Lesson Delete Handler
  const handleLessonDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteLesson(id);
    } catch (error) {
      console.error("Error deleting lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // File Download Handlers
  const handleFileDownload = (url: string, filename: string) => {
    window.open(url, "_blank");
  };

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // API calls would go here
        // Set form data
        // Set PDF and video files
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <div className="container mx-auto px-12 ">
        <div className="flex items-center gap-4 py-6">
          <span className=" text-base font-semibold ">
            {form.getValues("title")}
          </span>
          <SquarePen size={24} />
        </div>
        <LessonForm
          form={form}
          onSubmit={onSubmit}
          onDelete={handleLessonDelete}
          onVideoUpload={handleVideoUploaded}
          onPDFUpload={handlePDFUploaded}
          onVideoDelete={handleVideoDelete}
          onPDFDelete={handlePDFDelete}
          onFileDownload={handleFileDownload}
          pdfFile={pdfFile}
          videoFile={videoFile}
          isSubmitting={isLoading}
        />
      </div>
    </>
  );
}
