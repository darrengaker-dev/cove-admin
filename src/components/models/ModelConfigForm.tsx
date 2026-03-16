import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ApiKeyInput } from "./ApiKeyInput"
import { useSaveModelConfigs } from "@/hooks/useModels"
import type { ModelConfig } from "@/types/model"

const schema = z.object({
  apiKey: z.string().min(1, "API Key 不能为空"),
  defaultModel: z.string().min(1, "请选择默认模型"),
  isEnabled: z.boolean(),
  baseUrl: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ModelConfigFormProps {
  config: ModelConfig
  allConfigs: ModelConfig[]
}

export function ModelConfigForm({ config, allConfigs }: ModelConfigFormProps) {
  const mutation = useSaveModelConfigs()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      apiKey: config.apiKey,
      defaultModel: config.defaultModel,
      isEnabled: config.isEnabled,
      baseUrl: config.baseUrl ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      apiKey: config.apiKey,
      defaultModel: config.defaultModel,
      isEnabled: config.isEnabled,
      baseUrl: config.baseUrl ?? "",
    })
  }, [config, form])

  const onSubmit = (values: FormValues) => {
    const updated = allConfigs.map((c) =>
      c.provider === config.provider
        ? { ...c, ...values, baseUrl: values.baseUrl || null }
        : c
    )
    mutation.mutate(updated)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer">启用此供应商</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <ApiKeyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {config.baseUrl !== null && (
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Base URL</FormLabel>
                <FormControl>
                  <input
                    className="flex h-9 w-full rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://your-endpoint.com/v1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="defaultModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>默认模型</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {config.availableModels.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
