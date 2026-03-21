import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, GripVertical, Monitor } from "lucide-react"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PageHeader } from "@/components/layout/PageHeader"
import { BrandRulesTabs } from "@/components/settings/BrandRulesTabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNavigationSettings, useSaveNavigationSettings } from "@/hooks/useEnterpriseSettings"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ExpertNavItem, ExpertNavPlatform, ExpertNavigationSettings } from "@/types/enterprise-settings"

function SortableNavRow({
  item,
  onToggleVisible,
}: {
  item: ExpertNavItem
  onToggleVisible: (id: string, visible: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "bg-muted/70")}
    >
      <TableCell className="font-medium pl-8">
        <div className="relative inline-flex items-center pl-6">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="absolute left-0 inline-flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
            title="拖拽排序"
            aria-label={`拖拽排序：${item.label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5 -translate-x-[0.5px]" />
          </button>
          <span>{item.label}</span>
        </div>
      </TableCell>
      <TableCell>
        <Switch
          checked={item.visible}
          onCheckedChange={(v) => onToggleVisible(item.id, Boolean(v))}
        />
      </TableCell>
    </TableRow>
  )
}

export function NavigationPage() {
  const { data, isLoading } = useNavigationSettings()
  const saveMutation = useSaveNavigationSettings()
  const [platform, setPlatform] = useState<ExpertNavPlatform>("desktop")
  const [form, setForm] = useState<ExpertNavigationSettings | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  )

  useEffect(() => {
    if (data && !dirty) setForm(data)
  }, [data, dirty])

  const currentItems = useMemo(() => {
    if (!form) return []
    switch (platform) {
      case "desktop":
        return form.desktopNav
      case "word":
        return form.wordNav
      case "excel":
        return form.excelNav
      case "ppt":
        return form.pptNav
      default:
        return form.desktopNav
    }
  }, [form, platform])

  const updateCurrentItems = (nextItems: ExpertNavItem[]) => {
    setForm((prev) => {
      if (!prev) return prev
      switch (platform) {
        case "desktop":
          return { ...prev, desktopNav: nextItems }
        case "word":
          return { ...prev, wordNav: nextItems }
        case "excel":
          return { ...prev, excelNav: nextItems }
        case "ppt":
          return { ...prev, pptNav: nextItems }
        default:
          return prev
      }
    })
    setDirty(true)
    setSaved(false)
  }

  const toggleVisible = (id: string, visible: boolean) => {
    updateCurrentItems(currentItems.map((item) => (item.id === id ? { ...item, visible } : item)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = currentItems.findIndex((item) => item.id === active.id)
    const newIndex = currentItems.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    updateCurrentItems(arrayMove(currentItems, oldIndex, newIndex))
  }

  const handleSave = () => {
    if (!form) return
    saveMutation.mutate(form, {
      onSuccess: () => {
        setSaved(true)
        setDirty(false)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  if (isLoading || !form) {
    return (
      <div>
        <PageHeader
          title="导航设置"
          description="配置桌面端、Word 插件、Excel 插件、PPT 插件导航菜单的显示、隐藏和排序"
          actions={<BrandRulesTabs />}
        />
        <div className="p-6 space-y-5">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="导航设置"
        description="配置桌面端、Word 插件、Excel 插件、PPT 插件导航菜单的显示、隐藏和排序，保存后对专家模式生效"
        actions={<BrandRulesTabs />}
      />

      <div className="p-6 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">终端选择</CardTitle>
            <CardDescription className="text-xs">按终端分别配置导航菜单</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={platform} onValueChange={(v) => setPlatform(v as ExpertNavPlatform)}>
              <TabsList>
                <TabsTrigger value="desktop" className="gap-1.5">
                  <Monitor className="size-3.5" />
                  桌面端
                </TabsTrigger>
                <TabsTrigger value="word">
                  Word 插件
                </TabsTrigger>
                <TabsTrigger value="excel">
                  Excel 插件
                </TabsTrigger>
                <TabsTrigger value="ppt">
                  PPT 插件
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">菜单项配置</CardTitle>
            <CardDescription className="text-xs">支持显示/隐藏和拖拽排序</CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={currentItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-8">菜单项</TableHead>
                      <TableHead className="w-28">显示</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <SortableNavRow
                        key={item.id}
                        item={item}
                        onToggleVisible={toggleVisible}
                      />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            上次保存：{formatDate(form.updatedAt)} · {form.updatedBy}
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="size-4" />已保存
              </span>
            )}
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending || !dirty}>
              {saveMutation.isPending ? "保存中..." : "保存导航设置"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
