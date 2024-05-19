import { api } from "~/utils/api";
import { type FormSchema } from "~/schemas/productManagement";
import { useRouter } from "next/router";
import { Form } from "~/components/dashboard/ProductForm";

export { getServerSideProps } from "~/utils/serverSideAuth";

export default function Add() {
  const addProduct = api.productManagement.add.useMutation({
    async onSuccess() {
      await router.push("./");
    },
  });

  const router = useRouter();

  const submitCallback = (data: FormSchema) => {
    addProduct.mutate({ ...data });
  };

  return (
    <main className="flex h-full items-center justify-center">
      <Form
        initialData={null}
        submitCallback={submitCallback}
        isSubmitting={addProduct.isLoading}
      />
    </main>
  );
}
