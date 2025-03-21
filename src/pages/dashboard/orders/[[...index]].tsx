import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import DashboardHeader from "@/lib/dashboard/DashboardHeader";
import Layout from "@/lib/components/Layout";
import { type RouterOutputs, api } from "~/utils/api";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { useState } from "react";
import FetchResolver from "@/lib/components/FetchResolver";
import { useRouter } from "next/router";
import { Skeleton } from "~/lib/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export { getServerSideProps } from "~/utils/serverSideAuth";

type ProcessState = "processing" | "processed" | "cancelled";

export default function Orders() {
  const [processingState, setProcessState] =
    useState<ProcessState>("processing");

  const router = useRouter();

  const orderResponse = api.order.getAll.useQuery({
    processingState: processingState,
  });

  return (
    <Layout>
      <DashboardHeader />
      <main>
        <div className="flex items-center justify-between">
          <h2>Orders</h2>
          <div className="w-48">
            <Select
              value={processingState}
              onValueChange={(value) => setProcessState(value as ProcessState)}
            >
              <SelectTrigger className="capitalize">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <section>
          <div className="py-10">
            <FetchResolver
              {...orderResponse}
              loader={<Skeleton className="h-[500px] w-full" />}
            >
              {(data) => {
                // Filter data based on current state
                const filteredData =
                  processingState === "cancelled"
                    ? data.filter(
                        (order) => order.processingState === "cancelled",
                      )
                    : data;

                return (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <DataTable<Order, any>
                    columns={columns}
                    data={filteredData}
                    onRowClicked={async (order) => {
                      await router.push(`./${order.id}`);
                    }}
                  />
                );
              }}
            </FetchResolver>
          </div>
        </section>
      </main>
    </Layout>
  );
}

type Order = RouterOutputs["order"]["getAll"][number];

const columnHelper = createColumnHelper<Order>();

const columns = [
  columnHelper.accessor("id", {
    header: "Order ID",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("discord", {
    header: "Discord",
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("count", {
    header: "Number of Items",
  }),
  columnHelper.accessor("total", {
    header: "Total",
    cell: (cell) => `$${cell.getValue()}`,
  }),
  columnHelper.accessor("processingState", {
    header: "Processing State",
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    cell: (cell) => cell.getValue().toLocaleDateString(),
    header: "Created At",
  }),
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClicked,
}: DataTableProps<TData, TValue> & { onRowClicked: (TData: TData) => void }) {
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
                onClick={() => onRowClicked(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="cursor-pointer" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      </Table>
    </div>
  );
}
