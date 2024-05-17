import { useRouter } from "next/router";
import DashboardHeader from "~/components/dashboard/DashboardHeader";
import Layout from "~/components/ui/Layout";
import { Form } from "~/components/dashboard/ProductForm";
import { editProductSchema } from "~/schemas/productManagement";
import { type RouterInputs, api } from "~/utils/api";
import { useToast } from "~/components/ui/useToast";

export { getServerSideProps } from "~/utils/serverSideAuth";

export default function Product() {
  const router = useRouter();

  const productId = router.query.productId as string | undefined;

  const { data: product, isLoading } = api.productManagement.get.useQuery(
    productId!,
    { enabled: !!productId, refetchOnWindowFocus: false },
  );

  const { toast } = useToast();
  const editProduct = api.productManagement.edit.useMutation({
    async onSuccess() {
      await router.push("./");
    },
    onError(error) {
      if (error.data?.code && error.data.code === "CONFLICT") {
        toast({
          title: "Product has been edited by someone else. Please refresh page",
        });
      } else {
        toast({
          title: "Something went wrong",
        });
      }
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Something went wrong</div>;
  }

  const submitCallback = (
    data:
      | RouterInputs["productManagement"]["add"]
      | RouterInputs["productManagement"]["edit"],
  ) => {
    if ("id" in data) {
      editProduct.mutate(data);
    }
  };

  return (
    <Layout>
      <DashboardHeader />
      <main className="flex justify-center">
        <Form
          initialData={product}
          schema={editProductSchema}
          submitCallback={submitCallback}
          isSubmitting={editProduct.isLoading}
        />
      </main>
    </Layout>
  );
}
