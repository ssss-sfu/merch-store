import { Minus } from "lucide-react";
import { Button } from "@/ui/button";
import { FieldValidation } from "@/lib/components/FieldValidation";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { type RouterOutputs, api } from "~/utils/api";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useEffect } from "react";
import { formSchema, type FormSchema } from "~/schemas/productManagement";
import { type Size } from "@prisma/client";
import { UploadButton } from "../utils/uploadthing";
import { twMerge } from "tailwind-merge";
import ImageInput from "./ImageInput";
import type { ImageField } from "./ImageInput";
import { useState } from "react";
import { useToast } from "@/ui/use-toast";

export type FormProps = {
  initialData: RouterOutputs["productManagement"]["get"];
  submitCallback: (
    data: FormSchema | (FormSchema & { id: string; updatedAt: Date }),
  ) => void;
  isSubmitting: boolean;
};

export function Form({ initialData, submitCallback, isSubmitting }: FormProps) {
  const { toast } = useToast();
  const [imagesToDelete, setImagesToDelete] = useState<
    { url: string; image: ImageField }[]
  >([]);
  const { data: availableSizes, isLoading: allSizesIsLoading } =
    api.productManagement.getAllSizes.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormSchema>({
    values: {
      name: initialData?.name ?? "",
      images: initialData?.images ?? ([] as ImageField[]),
      price: initialData?.price ?? 0.0,
      sizes: convertSizesToObj<boolean>(
        initialData?.availableSizes,
        availableSizes,
        "boolean",
      ),
      quantity: convertSizesToObj(
        initialData?.availableSizes,
        availableSizes,
        "number",
      ),
      about: initialData?.aboutProducts ?? [],
      archived: initialData?.archived ?? false,
    },
    resolver: zodResolver(formSchema),
  });

  const archived = watch("archived");
  const sizes = watch("sizes");

  const {
    fields: aboutFields,
    append: appendAbout,
    remove: removeAbout,
  } = useFieldArray({
    control,
    name: "about",
    keyName: "key",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
    keyName: "key",
  });

  const deleteImageMutation = api.uploadthing.deleteImage.useMutation();

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imageFields[index];
    if (imageToRemove && imageToRemove.url) {
      setImagesToDelete((prev) => [
        ...prev,
        { url: imageToRemove.url, image: imageToRemove },
      ]);

      removeImage(index);

      const { dismiss } = toast({
        title: "Image removed",
        description: "The image will be deleted when you save the product",
        action: (
          <Button
            variant="outline"
            onClick={() => {
              appendImage(imageToRemove);
              setImagesToDelete((prev) =>
                prev.filter((item) => item.url !== imageToRemove.url),
              );
              dismiss();
            }}
          >
            Undo
          </Button>
        ),
      });
    }
  };

  const addAboutField = () => {
    appendAbout({ id: uuidv4(), description: "" });
  };

  const router = useRouter();

  useEffect(() => {
    if (availableSizes) {
      reset();
    }
  }, [reset, initialData, availableSizes]);

  const handleChecked = (size: Size, checkedState: CheckedState) => {
    if (checkedState === "indeterminate") return;
    setValue(`sizes.${size}`, checkedState);
  };

  if (allSizesIsLoading) {
    return <div>Loading...</div>;
  }

  if (!availableSizes) {
    return <div>Something went wrong</div>;
  }

  return (
    <form
      className="flex w-full max-w-lg flex-col gap-4"
      onSubmit={handleSubmit(async (data) => {
        // Delete all images marked for deletion before submitting
        if (imagesToDelete.length > 0) {
          try {
            for (const item of imagesToDelete) {
              await deleteImageMutation.mutateAsync({ url: item.url });
            }
            setImagesToDelete([]);
          } catch (error) {
            console.error("Failed to delete images:", error);
            toast({
              title: "Error",
              description: "Failed to delete some images",
              variant: "destructive",
            });
          }
        }

        submitCallback(data);
      })}
    >
      <div className="flex items-center justify-between">
        <h2 className="self-start">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>
        {initialData && (
          <Controller
            control={control}
            name="archived"
            render={({ field: { onChange } }) => {
              return (
                <Select
                  onValueChange={(e) => {
                    onChange(e === "archived" ? true : false);
                  }}
                  value={archived ? "archived" : "active"}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />
        )}
      </div>
      <div className="grid gap-2">
        <label htmlFor="name">Name</label>
        <FieldValidation error={errors.name}>
          <Input type="text" id="name" {...register("name")} />
        </FieldValidation>
      </div>
      <div className="grid gap-2">
        <label htmlFor="price">Price</label>
        <FieldValidation error={errors.price}>
          <Input id="price" type="text" {...register("price")} />
        </FieldValidation>
      </div>
      <div className="grid gap-2">
        <label htmlFor="images">Images</label>
        <div className="grid gap-2">
          <ImageInput
            imageFields={imageFields}
            errors={errors}
            removeImage={handleRemoveImage}
            setImageFields={(fields: ImageField[]) => {
              const updatedFields = fields.map((field) => ({
                id: field.id,
                url: field.url,
                description: field.description,
              }));
              setValue("images", updatedFields);
            }}
          />
          <UploadButton
            appearance={{
              button:
                "h-10 w-auto bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90",
            }}
            config={{ cn: twMerge }}
            content={{ button: "Upload Image" }}
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              res.forEach((file) => {
                appendImage({ id: uuidv4(), url: file.url, description: "" });
              });
            }}
            onUploadError={(error: Error) => {
              alert(
                `error, please try again, or upload an image ${error.message}`,
              );
            }}
          />
          {errors.images?.message && imageFields.length === 0 && (
            <p className="text-destructive">{String(errors.images.message)}</p>
          )}
        </div>
      </div>
      <h3>Sizes</h3>
      <div className="grid grid-cols-3 gap-2">
        {availableSizes.map(({ size }) => {
          return (
            <div key={size} className="flex items-center gap-1">
              <label htmlFor={size}>{size}</label>
              <Checkbox
                checked={sizes[size]}
                onCheckedChange={(e) => {
                  handleChecked(size, e);
                }}
              />
            </div>
          );
        })}
      </div>
      {errors.sizes?.message && !Object.values(sizes).some(Boolean) && (
        <p className="text-destructive">{String(errors.sizes?.message)}</p>
      )}

      <h3>Stock Sizes</h3>
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(sizes).map((size) => {
          if (sizes[size as Size]) {
            return (
              <div key={size} className="flex items-center gap-1">
                <label htmlFor={size}>{size}</label>
                <FieldValidation error={errors.sizes?.[size as Size]}>
                  <Input
                    className="w-[inherit]"
                    type="number"
                    placeholder="Quantity"
                    step={1}
                    min={0}
                    {...register(`quantity.${size as Size}`, {
                      valueAsNumber: true,
                    })}
                    defaultValue={
                      initialData?.availableSizes.find((s) => s.size === size)
                        ?.quantity ?? 10
                    }
                  />
                </FieldValidation>
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="grid gap-2">
        <h2>About</h2>
        <div className="grid gap-4">
          {aboutFields.map((field, index) => {
            return (
              <div key={field.id} className="flex items-center gap-2">
                <FieldValidation error={errors.about?.[index]?.description}>
                  <Textarea
                    key={field.id}
                    className="max-h-[8rem] min-h-[4rem] resize-none"
                    {...register(`about.${index}.description`)}
                  />
                </FieldValidation>
                <Button variant="ghost" onClick={() => removeAbout(index)}>
                  <Minus />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={addAboutField}
            className="w-full"
          >
            Add Bullet Point
          </Button>
        </div>
      </div>
      <div className="flex justify-end gap-5">
        <Button
          type="button"
          variant="destructive"
          onClick={() => router.push("./")}
        >
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "Edit Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

function convertSizesToObj<T extends boolean | number>(
  selectedSizes:
    | NonNullable<RouterOutputs["productManagement"]["get"]>["availableSizes"]
    | undefined,
  availableSizes: RouterOutputs["productManagement"]["getAllSizes"] | undefined,
  returnType: "boolean" | "number",
): Record<string, T> {
  if (!availableSizes || !selectedSizes) {
    return {} as Record<string, T>;
  }

  const sizes: Record<string, boolean | number> = {};
  for (const size of availableSizes) {
    const has = selectedSizes.find((s) => s.size === size.size);
    if (returnType === "boolean") {
      sizes[size.size] = !!has;
    } else {
      sizes[size.size] = has ? has.quantity : 10;
    }
  }
  return sizes as Record<string, T>;
}
