import { GetPromApiKeyResponse } from "../../../main/requests/prom-api-key.requests"
import { Response } from "../../../types"

export async function savePromApiKey(promApiKey: string) {
  return (window as any).api.setPromApiKey({ promApiKey })
}

export async function getPromApiKey(): Promise<
  Response<GetPromApiKeyResponse>
> {
  return (window as any).api.getPromApiKey()
}
