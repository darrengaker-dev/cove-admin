import { useState, useMemo } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { UserTable } from "@/components/users/UserTable"
import { DeptTree } from "@/components/users/DeptTree"
import { RegistrationApprovalPanel } from "@/components/users/RegistrationApprovalSheet"
import { BatchImportDialog } from "@/components/users/BatchImportDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_MEMBERS, MOCK_DEPTS } from "@/mocks/data/users"
import { usePendingRegistrations } from "@/hooks/useRegistrations"
import type { MemberStatus } from "@/types/user"

const PAGE_SIZE = 20

export function UsersPage() {
  const [tab, setTab] = useState<"registered" | "pending">("registered")
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<MemberStatus | "all">("all")
  const [page, setPage] = useState(1)
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
        description={
          tab === "registered"
            ? (selectedDeptName ? `${selectedDeptName} · ${filtered.length} 人` : `共 ${filtered.length} 名成员`)
            : `共 ${pendingRegs.length} 条待审批`
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "registered" | "pending")} className="flex h-full flex-col">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="registered" className="gap-1.5">
              已注册
              <Badge variant="secondary" className="text-xs py-0 px-1.5">{filtered.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              待审批
              {pendingRegs.length > 0 && (
                <Badge className="text-xs py-0 px-1.5 bg-orange-500 hover:bg-orange-500">{pendingRegs.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registered" className="flex-1 min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 rounded-xl border overflow-hidden">
              <aside className="w-52 shrink-0 border-r flex flex-col overflow-hidden">
                <DeptTree
                  depts={MOCK_DEPTS}
                  selectedId={selectedDeptId}
                  onSelect={handleDeptSelect}
                  totalMemberCount={MOCK_MEMBERS.length}
                />
              </aside>

              <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索姓名、账户ID、工号..."
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

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setImportOpen(true)}
                    >
                      <Upload className="size-3.5" />
                      批量导入
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5">
                      <UserPlus className="size-3.5" />
                      新增成员
                    </Button>
                  </div>
                </div>

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
          </TabsContent>

          <TabsContent value="pending" className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full rounded-xl border overflow-hidden">
              <RegistrationApprovalPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BatchImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
