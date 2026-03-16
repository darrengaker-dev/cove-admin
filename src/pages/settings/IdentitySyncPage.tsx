import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/PageHeader"
import { SSOConfigCard } from "@/components/identity-sync/SSOConfigCard"
import { OrgSyncCard } from "@/components/identity-sync/OrgSyncCard"

export function IdentitySyncPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="身份与同步"
        description="配置 SSO 单点登录及组织架构自动同步，员工用工号直接登录，无需单独注册"
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="sso" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sso">SSO 认证配置</TabsTrigger>
            <TabsTrigger value="orgsync">组织架构同步</TabsTrigger>
          </TabsList>

          <TabsContent value="sso">
            <div className="max-w-3xl">
              <SSOConfigCard />
            </div>
          </TabsContent>

          <TabsContent value="orgsync">
            <div className="max-w-4xl">
              <OrgSyncCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
