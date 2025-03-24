import { Minus, Move } from "lucide-react";
import { Button } from "@/ui/button";
import { FieldValidation } from "@/lib/components/FieldValidation";
import { Input } from "@/ui/input";
import type { FieldErrors, FieldError } from "react-hook-form";
import Image from "next/image";
import React, { useState } from "react";
import { Skeleton } from "@/ui/skeleton";

export interface ImageField {
  key: string;
  url: string;
  id: string;
  description: string;
}

interface ImageInputProps {
  imageFields: ImageField[];
  errors: FieldErrors<{
    images: { url: FieldError; description: FieldError }[];
  }>;
  removeImage: (index: number) => void;
  setImageFields: (fields: ImageField[]) => void;
}

export default function ImageInput({
  imageFields,
  errors,
  removeImage,
  setImageFields,
}: ImageInputProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    index: number,
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLButtonElement>,
    index: number,
  ) => {
    setDraggedIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    moveImage(draggedIndex, index);
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImageFields = [...imageFields];
    const [movedImage] = newImageFields.splice(fromIndex, 1);
    if (movedImage) {
      newImageFields.splice(toIndex, 0, movedImage);
    }
    setImageFields(newImageFields);
  };

  const handleChange = (index: number, value: string) => {
    const newImageFields = [...imageFields];
    if (newImageFields[index]) {
      newImageFields[index].description = value;
      setImageFields(newImageFields);
    }
  };

  const handleRemoveImage = (index: number) => {
    removeImage(index);
  };

  return (
    <>
      {imageFields.map((field, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
          onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, index)}
          onDragOver={(e) => e.preventDefault()}
          onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) =>
            handleTouchEnd(e, index)
          }
        >
          {field.url ? (
            <Image
              src={field.url}
              alt={`Image ${index}`}
              width={150}
              height={150}
              className="h-24 w-full max-w-32 rounded-md bg-white"
            />
          ) : (
            <Skeleton className="h-24 w-32" />
          )}

          <FieldValidation
            error={errors.images?.[index]?.description as FieldError}
          >
            <Input
              value={field.description}
              onChange={(e) => handleChange(index, e.target.value)}
              id={`image-${index}`}
              placeholder="Description (optional)"
            />
          </FieldValidation>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              type="button"
              onDragStart={(e: React.DragEvent<HTMLButtonElement>) =>
                handleDragStart(e, index)
              }
              onTouchStart={(e: React.TouchEvent<HTMLButtonElement>) =>
                handleTouchStart(e, index)
              }
              draggable
            >
              <Move />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleRemoveImage(index)}
            >
              <Minus />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}
