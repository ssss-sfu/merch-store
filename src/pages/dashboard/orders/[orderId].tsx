import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/router";
import FetchResolver from "@/lib/components/FetchResolver";
import Layout from "@/lib/components/Layout";
import { type RouterOutputs, api } from "~/utils/api";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import DashboardHeader from "@/lib/dashboard/DashboardHeader";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { type ProcessingState } from "@prisma/client";
export { getServerSideProps } from "~/utils/serverSideAuth";

export default function OrderId() {
  const router = useRouter();
  const orderQuery = api.order.get.useQuery(router.query.orderId as string, {
    enabled: !!router.query.orderId,
  });

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor("product.name", {
        header: "Product Name",
        footer: () => "Total",
      }),
      columnHelper.accessor("size", {
        header: "Size",
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity (In Stock)",
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (cell) => `$${cell.getValue() * cell.row.original.quantity}`,
        footer: () => `$${orderQuery.data?.total ?? 0}`,
      }),
    ];
    return columns;
  }, [orderQuery]);

  const queryUtils = api.useContext();

  const updateProcessingState = api.order.updateProcessingState.useMutation({
    onSuccess(data) {
      queryUtils.order.get.setData(data.id, data);
    },
  });

  return (
    <Layout>
      <DashboardHeader />
      <main>
        <article>
          <h2>Order Information</h2>
          <FetchResolver {...orderQuery}>
            {(order) => {
              return order ? (
                <div>
                  <ul>
                    <li>Order ID: {order.id}</li>
                    <li className="flex items-center gap-2">
                      Status
                      <Select
                        value={orderQuery.data?.processingState}
                        onValueChange={(state: ProcessingState) => {
                          updateProcessingState.mutate({
                            id: order.id,
                            processingState: state,
                          });
                        }}
                      >
                        <SelectTrigger
                          className="w-32"
                          disabled={updateProcessingState.isLoading}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="processed">Processed</SelectItem>
                        </SelectContent>
                      </Select>
                    </li>
                    <li>Name: {order.name}</li>
                    <li>Discord: {order.discord}</li>
                    <li>Email: {order.email}</li>
                    <li>Ordered At: {order.createdAt.toLocaleDateString()}</li>
                  </ul>
                  <div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <DataTable<OrderedItem, any>
                      columns={columns}
                      data={order.orderedItems}
                    />
                  </div>
                </div>
              ) : (
                <div>Order not found</div>
              );
            }}
          </FetchResolver>
        </article>
      </main>
    </Layout>
  );
}

type OrderedItem = NonNullable<
  RouterOutputs["order"]["get"]
>["orderedItems"][number];

const columnHelper = createColumnHelper<OrderedItem>();

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    {cell.column.id === "quantity" && (
                      <span>
                        (
                        {(
                          data[row.index] as OrderedItem
                        ).product.availableSizes?.find(
                          (productSize) =>
                            productSize.productSizeId ===
                            (data[row.index] as OrderedItem).size,
                        )?.quantity ?? "0"}
                        )
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          {table.getFooterGroups().map((getFooterGroups) => (
            <TableRow key={getFooterGroups.id}>
              {getFooterGroups.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      </Table>
    </div>
  );
}
