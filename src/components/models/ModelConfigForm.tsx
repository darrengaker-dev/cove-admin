import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Trash2, Plus } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ApiKeyInput } from "./ApiKeyInput"
import { useSaveModelConfigs } from "@/hooks/useModels"
import type { ModelConfig } from "@/types/model"

const schema = z.object({
  apiKeys: z.array(z.object({ value: z.string().min(1, "API Key 不能为空") })).min(1, "至少需要一个 API Key"),
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
      apiKeys: config.apiKeys.map((k) => ({ value: k })),
      defaultModel: config.defaultModel,
      isEnabled: config.isEnabled,
      baseUrl: config.baseUrl ?? "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "apiKeys" })

  useEffect(() => {
    form.reset({
      apiKeys: config.apiKeys.map((k) => ({ value: k })),
      defaultModel: config.defaultModel,
      isEnabled: config.isEnabled,
      baseUrl: config.baseUrl ?? "",
    })
  }, [config, form])

  const onSubmit = (values: FormValues) => {
    const updated = allConfigs.map((c) =>
      c.provider === config.provider
        ? { ...c, apiKeys: values.apiKeys.map((k) => k.value).filter(Boolean), defaultModel: values.defaultModel, isEnabled: values.isEnabled, baseUrl: values.baseUrl || null }
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

        <FormItem>
          <FormLabel>API Key</FormLabel>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`apiKeys.${index}.value`}
                  render={({ field: f }) => (
                    <FormControl>
                      <ApiKeyInput value={f.value} onChange={f.onChange} className="flex-1" />
                    </FormControl>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => append({ value: "" })}
          >
            <Plus className="size-3.5 mr-1" />
            添加 Key
          </Button>
          {form.formState.errors.apiKeys?.root && (
            <p className="text-sm text-destructive">{form.formState.errors.apiKeys.root.message}</p>
          )}
        </FormItem>

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
