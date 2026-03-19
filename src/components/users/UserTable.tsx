import { DataTable, type Column } from "@/components/common/DataTable"
import { StatusBadge } from "@/components/common/StatusBadge"
import { UserActionsMenu } from "./UserActionsMenu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import type { Member } from "@/types/user"

const columns: Column<Member>[] = [
  {
    key: "name",
    header: "姓名",
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="text-xs bg-muted">{row.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-sm truncate">{row.name}</span>
          {row.isAdmin && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">管理员</Badge>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "loginName",
    header: "账户ID",
    width: "120px",
    cell: (row) => (
      <span className="text-sm text-muted-foreground font-mono">{row.loginName}</span>
    ),
  },
  {
    key: "dept",
    header: "部门",
    width: "110px",
    cell: (row) => <span className="text-sm text-muted-foreground">{row.primaryDeptName}</span>,
  },
  {
    key: "jobTitle",
    header: "职称",
    width: "120px",
    cell: (row) => (
      <span className="text-sm">{row.jobTitle ?? "—"}</span>
    ),
  },
  {
    key: "employeeNo",
    header: "工号",
    width: "90px",
    cell: (row) => (
      <span className="text-sm text-muted-foreground font-mono">{row.employeeNo ?? "—"}</span>
    ),
  },
  {
    key: "status",
    header: "状态",
    width: "80px",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "hiredAt",
    header: "入职时间",
    width: "110px",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.hiredAt ? formatDate(row.hiredAt) : "—"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: "48px",
    cell: (row) => <UserActionsMenu user={row} />,
  },
]

interface UserTableProps {
  data: Member[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function UserTable({ data, total, page, limit, onPageChange, isLoading }: UserTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      isLoading={isLoading}
      keyExtractor={(row) => row.id}
    />
  )
}
