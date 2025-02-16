import { useRouter } from "next/router";
import DashboardHeader from "@/lib/dashboard/DashboardHeader";
import Layout from "@/lib/components/Layout";
import { Form } from "@/lib/dashboard/ProductForm";
import { api } from "~/utils/api";
import { useToast } from "@/ui/use-toast";
import { type FormSchema } from "~/schemas/productManagement";
import { Skeleton } from "~/lib/components/ui/skeleton";

export { getServerSideProps } from "~/utils/serverSideAuth";

export default function Product() {
  return (
    <Layout>
      <DashboardHeader />
      <Content />
    </Layout>
  );
}

function Content() {
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
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-4">
        <div className="mx-auto flex justify-between">
          <Skeleton className="inline-block h-10 w-20" />
          <Skeleton className="inline-block h-10 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mx-auto flex w-full max-w-lg justify-end gap-2">
          <Skeleton className="inline-block h-10 w-20" />
          <Skeleton className="inline-block h-10 w-20" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Something went wrong</div>;
  }

  const submitCallback = (data: FormSchema) => {
    editProduct.mutate({
      ...data,
      id: product.id,
      updatedAt: product.updatedAt,
    });
  };
  return (
    <main className="flex justify-center">
      <Form
        initialData={product}
        submitCallback={submitCallback}
        isSubmitting={editProduct.isLoading}
      />
    </main>
  );
}
