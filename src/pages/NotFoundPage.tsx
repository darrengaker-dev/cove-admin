import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <FileQuestion className="size-16 text-muted-foreground/30" strokeWidth={1} />
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">找不到该页面</p>
      <Button asChild variant="outline">
        <Link to="/dashboard">返回首页</Link>
      </Button>
    </div>
  )
}
