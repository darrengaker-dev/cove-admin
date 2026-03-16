import { useState, useMemo } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { UserTable } from "@/components/users/UserTable"
import { DeptTree } from "@/components/users/DeptTree"
import { RegistrationApprovalSheet } from "@/components/users/RegistrationApprovalSheet"
import { BatchImportDialog } from "@/components/users/BatchImportDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Upload, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MOCK_MEMBERS, MOCK_DEPTS } from "@/mocks/data/users"
import { usePendingRegistrations } from "@/hooks/useRegistrations"
import type { MemberStatus } from "@/types/user"

const PAGE_SIZE = 20

export function UsersPage() {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<MemberStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const { data: pendingRegs = [] } = usePendingRegistrations()

  const filtered = useMemo(() => {
    return MOCK_MEMBERS.filter((m) => {
      if (selectedDeptId && m.primaryDeptId !== selectedDeptId) return false
      if (status !== "all" && m.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          m.name.toLowerCase().includes(q) ||
          m.loginName.toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q) ||
          (m.employeeNo ?? "").toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [selectedDeptId, search, status])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectedDeptName = selectedDeptId
    ? MOCK_DEPTS.find((d) => d.id === selectedDeptId)?.name
    : null

  const handleDeptSelect = (id: string | null) => {
    setSelectedDeptId(id)
    setPage(1)
  }

  const handleFilter = () => setPage(1)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="用户管理"
        description={selectedDeptName ? `${selectedDeptName} · ${filtered.length} 人` : `共 ${filtered.length} 名成员`}
        actions={
          <div className="flex items-center gap-2">
            {/* 注册审批入口 */}
            <Button
              variant="outline" size="sm"
              className="h-8 gap-1.5 relative"
              onClick={() => setApprovalOpen(true)}
            >
              <ClipboardCheck className="size-3.5" />
              注册审批
              {pendingRegs.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] bg-orange-500 hover:bg-orange-500">
                  {pendingRegs.length}
                </Badge>
              )}
            </Button>

            {/* 批量导入 */}
            <Button
              variant="outline" size="sm"
              className="h-8 gap-1.5"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="size-3.5" />
              批量导入
            </Button>

            {/* 新增成员 */}
            <Button size="sm" className="h-8 gap-1.5">
              <UserPlus className="size-3.5" />
              新增成员
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 min-h-0">
        {/* 左侧部门树 */}
        <aside className="w-52 shrink-0 border-r flex flex-col overflow-hidden">
          <DeptTree
            depts={MOCK_DEPTS}
            selectedId={selectedDeptId}
            onSelect={handleDeptSelect}
            totalMemberCount={MOCK_MEMBERS.length}
          />
        </aside>

        {/* 右侧用户列表 */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* 筛选栏 */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索姓名、账号、工号..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleFilter() }}
                className="pl-8 h-8 w-64"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v as MemberStatus | "all"); handleFilter() }}>
              <SelectTrigger className="h-8 w-28">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">在职</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
                <SelectItem value="resigned">已离职</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <div className="flex-1 overflow-auto min-w-0">
            <UserTable
              data={paginated}
              total={filtered.length}
              page={page}
              limit={PAGE_SIZE}
              onPageChange={setPage}
              isLoading={false}
            />
          </div>
        </main>
      </div>

      <RegistrationApprovalSheet open={approvalOpen} onClose={() => setApprovalOpen(false)} />
      <BatchImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
