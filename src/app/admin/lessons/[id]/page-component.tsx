"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { LessonForm } from "../LessonForm";
import { LoadingOverlay } from "@/components/loadingOverlay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateLessonFormSchema } from "../lessons.schema";
import { updateLesson } from "@/actions/lessons";
import { toast } from "sonner";
import { FileItem, LessonFormData, LessonPageComponentProps } from "../lessons.types";

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

  const submitLessonHandler = async (data: UpdateLessonFormSchema) => {
    const { title, description, sequence, id } = data;
    let pdfUrl: string = "",
      videoUrl: string = "";
    try {
      await updateLesson({
        title: title,
        description: description,
        sequence: Number(sequence),
        pdf_url: pdfUrl,
        video_url: videoUrl,
        id,
      });
      form.reset();
      router.refresh();
      toast.success("Lesson updated successfully");
    } catch (error) {
      toast.error("Error submitting lesson");
    }
  };

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
      // API call would go here
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
      // API call would go here
      setPdfFile(null);
    } catch (error) {
      console.error("Error deleting PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit Handler
  const onSubmit = async (data: LessonFormData) => {
    let pdfUrl: string = "",
      videoUrl: string = "";

    try {
      setIsLoading(true);
      await updateLesson({
        title: data.title,
        description: data.description,
        sequence: Number(data.sequence),
        pdf_url: pdfUrl,
        video_url: videoUrl,
        id: data.id,
      });

      form.reset();
      router.refresh();
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
      // API call would go here
      router.push("/admin/lessons");
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
      <Card className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl shadow-lg rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 my-8 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600">
        <CardHeader>
          <CardTitle>Lesson Limbic Ikinamada Bouquet</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
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
        </CardContent>
      </Card>
    </>
  );
}
