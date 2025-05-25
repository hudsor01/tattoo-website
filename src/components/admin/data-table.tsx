"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, RefreshCw, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecordObject } from "@/types/utility-types"

export interface DataTableColumn<T extends RecordObject> {
  id: string
  accessorKey?: string
  header: string | (() => React.ReactNode)
  cell?: (props: { row: { original: T }, getValue: () => unknown }) => React.ReactNode
  enableSorting?: boolean
  enableHiding?: boolean
  meta?: {
    className?: string
  }
}

export interface DataTableAction<T extends RecordObject> {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export interface DataTableProps<T extends RecordObject> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  searchPlaceholder?: string
  onRefresh?: () => void
  onAdd?: () => void
  actions?: DataTableAction<T>[]
  enableRowSelection?: boolean
  enableSearch?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  className?: string
}

export function DataTable<T extends RecordObject>({
  data,
  columns: columnsProp,
  loading = false,
  searchPlaceholder = "Search...",
  onRefresh,
  onAdd,
  actions = [],
  enableRowSelection = false,
  enableSearch = true,
  enableColumnVisibility = true,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Build columns with selection and actions
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = []

    // Add selection column if enabled
    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
    }

    // Add data columns
    cols.push(
      ...columnsProp.map((col): ColumnDef<T> => ({
        id: col.id,
        accessorKey: col.accessorKey ?? col.id,
        header: typeof col.header === "string" 
          ? ({ column }: { column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' } }) => (
              col.enableSorting !== false ? (
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="h-8 px-2 lg:px-3"
                >
                  {col.header as string}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <span className="font-medium">{col.header as string}</span>
              )
            )
          : col.header,
        cell: col.cell ?? (({ getValue }) => {
          const value = getValue()
          
          // Handle different value types
          if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>
          }
          
          if (typeof value === "boolean") {
            return (
              <Badge variant={value ? "default" : "secondary"}>
                {value ? "Yes" : "No"}
              </Badge>
            )
          }
          
          if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            return new Date(value).toLocaleDateString()
          }
          
          return <div className={col.meta?.className}>{String(value)}</div>
        }),
        enableSorting: col.enableSorting,
        enableHiding: col.enableHiding,
        meta: col.meta ?? undefined,
      }))
    )

    // Add actions column if actions provided
    if (actions.length > 0) {
      cols.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const rowData = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={`action-${action.label}`}
                    onClick={() => action.onClick(rowData)}
                    className="cursor-pointer"
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      })
    }

    return cols
  }, [columnsProp, enableRowSelection, actions])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[70px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns.length }, (_, i) => `header-${i}`).map((key) => (
                  <TableHead key={key}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, i) => `row-${i}`).map((rowKey) => (
                <TableRow key={rowKey}>
                  {Array.from({ length: columns.length }, (_, j) => `${rowKey}-cell-${j}`).map((cellKey) => (
                    <TableCell key={cellKey}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          )}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="rounded-md border mt-4">
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
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DataTable