import { Minus } from "lucide-react";
import { Button } from "@/ui/button";
import { FieldValidation } from "../ui/FieldValidation";
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

export type FormProps = {
  initialData: RouterOutputs["productManagement"]["get"];
  submitCallback: (
    data: FormSchema | (FormSchema & { id: string; updatedAt: Date }),
  ) => void;
  isSubmitting: boolean;
};

export function Form({ initialData, submitCallback, isSubmitting }: FormProps) {
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
      imageLink: initialData?.imageLink ?? "",
      price: initialData?.price ?? 0.0,
      sizes: {},
      about: initialData?.aboutProducts ?? [],
      archived: initialData?.archived ?? false,
    },
    resolver: zodResolver(formSchema),
  });

  const archived = watch("archived");
  const sizes = watch("sizes");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "about",
    keyName: "key",
  });

  const addField = () => {
    append({ id: uuidv4(), description: "" });
  };

  const router = useRouter();

  const { data: availableSizes, isLoading: allSizesIsLoading } =
    api.productManagement.getAllSizes.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

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
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit((data) => submitCallback(data))();
      }}
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
        <label htmlFor="link">Image Link</label>
        <FieldValidation error={errors.imageLink}>
          <Input {...register("imageLink")} id="link" />
        </FieldValidation>
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
      <div className="grid gap-2">
        <h2>About</h2>
        <div className="grid gap-4">
          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex items-center gap-2">
                <FieldValidation error={errors.about?.[index]?.description}>
                  <Textarea
                    key={field.id}
                    className="max-h-[8rem] min-h-[4rem] resize-none"
                    {...register(`about.${index}.description`)}
                  />
                </FieldValidation>
                <Button variant="ghost" onClick={() => remove(index)}>
                  <Minus />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={addField}
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
