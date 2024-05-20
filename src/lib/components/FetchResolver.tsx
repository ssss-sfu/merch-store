import { type TRPCClientErrorBase } from "@trpc/client";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type DefaultErrorShape } from "@trpc/server";

type Props<TData> = UseTRPCQueryResult<
  TData,
  TRPCClientErrorBase<DefaultErrorShape>
> & {
  children: (data: TData) => React.ReactNode;
};

export default function FetchResolver<TData>({
  data,
  isLoading,
  isError,
  children,
}: Props<TData>) {
  if (isLoading) {
    return <div>Loading...</div>;
  } else if (isError) {
    return <div>Something went wrong</div>;
  } else {
    return children(data);
  }
}
