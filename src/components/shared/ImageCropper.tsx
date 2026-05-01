"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, RotateCw, ZoomIn } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string | null;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ASPECTS = [
  { label: "Free", value: null }, // Using null to indicate free aspect or handle specifically
  { label: "1:1", value: 1 / 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "9:16", value: 9 / 16 },
];

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1); // Default to 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  const onRotationChange = (rotation: number) => setRotation(rotation);

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
  ): Promise<string | null> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
      );

      return new Promise((resolve) => {
        canvas.toBlob((file) => {
          if (file) {
            // Create a local URL for preview
            resolve(URL.createObjectURL(file));
          } else {
            resolve(null);
          }
        }, "image/jpeg");
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 gap-0 bg-zinc-950 border-zinc-800 text-white overflow-hidden">
        <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-950 z-10">
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Image</span>
            <div className="flex gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a.label}
                  onClick={() =>
                    setAspect(a.value === null ? undefined : a.value)
                  }
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    aspect === a.value ||
                    (aspect === undefined && a.value === null)
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 bg-zinc-900 w-full min-h-[300px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-4">
            <ZoomIn className="w-4 h-4 text-zinc-400" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(v) => setZoom(v[0])}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <RotateCw className="w-4 h-4 text-zinc-400" />
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(v) => setRotation(v[0])}
              className="flex-1"
            />
          </div>

          <DialogFooter className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
