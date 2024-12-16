import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateOrUpdateLessonSchema } from "./lessons.schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LessonFormProps = {
  form: UseFormReturn<CreateOrUpdateLessonSchema>;
  onSubmit: (data: CreateOrUpdateLessonSchema) => void;
  defaultValues: CreateOrUpdateLessonSchema | null;
  onDelete?: (id: number) => Promise<void>;
};

export const LessonForm = ({
  form,
  onSubmit,
  defaultValues,
  onDelete,
}: LessonFormProps) => {
  const isSubmitting = form.formState.isSubmitting;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleDelete = async () => {
    const id = parseInt(form.getValues("id") || "0");
    console.log("Delete button clicked");
    console.log(onDelete);
    
    
    if (onDelete && !isNaN(id)) {
      try {
        await onDelete(id);
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error in handleDelete:", error);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    step="1"
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
          <FormField
            control={form.control}
            name="video"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Video Lesson</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="video/*"
                    disabled={isSubmitting}
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pdf"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>PDF Article</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf"
                    disabled={isSubmitting}
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <Button
            disabled={isSubmitting}
            type="submit"
            className={
              form.getValues("intent") === "update" ? "w-1/2" : "w-full"
            }
          >
            {form.getValues("intent") === "update" ? "Update" : "Submit"}
          </Button>

          {form.getValues("intent") === "update" && (
            <>
              <Button
                type="button"
                variant="destructive"
                className="w-1/2"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>

              <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Lesson</DialogTitle>
                  </DialogHeader>
                  <p>
                    Are you sure you want to delete {form.getValues("title")}?
                  </p>
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
            </>
          )}
        </div>
      </form>
    </Form>
  );
};
