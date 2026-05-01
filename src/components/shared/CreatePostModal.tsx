"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSquare, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { postSchema, PostFormValues } from "@/schemas/post";
import { createPost } from "@/actions/createPost";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";
import { ImageCropper } from "./ImageCropper";

export function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      content: "",
      is_anonymous: true,
    },
  });

  async function onSubmit(data: PostFormValues) {
    setIsSubmitting(true);
    // In a real implementation, you would upload the imagePreview (blob) here
    // and add the URL to the data. For now we just mock content.
    const result = await createPost(data);
    setIsSubmitting(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setOpen(false);
      form.reset();
      setImagePreview(null);
      setImageSrc(null);
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSrc(reader.result?.toString() || null)
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleMarkdownAction = (action: "bold" | "italic" | "underline") => {
    const current = form.getValues("content");
    let wrap = "";
    if (action === "bold") wrap = "**";
    if (action === "italic") wrap = "_";
    if (action === "underline") wrap = "<u>"; // Markdown doesn't standardly support underline, using HTML tag or custom handling

    // Simple append for now, focusing on the UI structure
    // A robust editor would handle cursor position insertion.
    // Given the constraints, we enable the buttons to show intent.
    form.setValue(
      "content",
      current + ` ${wrap}text${action === "underline" ? "</u>" : wrap} `
    );
  };

  // Markdown actions handling


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
          <PlusSquare className="w-4 h-4 mr-2" />
          Confess
        </Button>
      </DialogTrigger>

      {/* Redesigned Content: Solid, Dark, Elegant */}
      <DialogContent className="sm:max-w-[600px] border-zinc-800 bg-zinc-950 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-950">
          <DialogTitle className="text-xl font-bold text-center tracking-tight">
            Write a Confession
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Content Area */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        onMarkdownAction={handleMarkdownAction}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Preview & Upload */}
              <div>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-[300px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">
                      Add an image (optional)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>



              <div className="flex items-center justify-between pt-2">
                <FormField
                  control={form.control}
                  name="is_anonymous"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-zinc-300 cursor-pointer">
                        Post Anonymously
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="p-6 border-t border-zinc-900 bg-zinc-950 sticky bottom-0 z-10">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 text-lg tracking-wide shadow-lg shadow-emerald-900/20"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                Publish Confession
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Image Cropper Overlay */}
      {imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          onCropComplete={(croppedUrl) => {
            setImagePreview(croppedUrl);
            setImageSrc(null); // Close cropper
          }}
          onCancel={() => {
            setImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </Dialog>
  );
}
