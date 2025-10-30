import { z } from "zod"

export const setApiKeyFormSchema = z.object({
  apiKey: z
    .string()
    .min(1, "Api ключ не може бути менше одного символу"),
})

export type SetApiKeyFormType = z.infer<
  typeof setApiKeyFormSchema
>
