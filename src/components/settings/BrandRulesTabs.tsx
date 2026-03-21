import { Link, useLocation } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BrandRulesTabs() {
  const location = useLocation()
  const value = location.pathname === "/settings/rules"
    ? "rules"
    : location.pathname === "/settings/navigation"
      ? "navigation"
      : "brand"

  return (
    <Tabs value={value}>
      <TabsList>
        <TabsTrigger value="brand" asChild>
          <Link to="/settings/brand">品牌</Link>
        </TabsTrigger>
        <TabsTrigger value="rules" asChild>
          <Link to="/settings/rules">规则</Link>
        </TabsTrigger>
        <TabsTrigger value="navigation" asChild>
          <Link to="/settings/navigation">导航</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
