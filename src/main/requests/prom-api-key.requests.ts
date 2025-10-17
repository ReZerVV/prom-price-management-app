import { Response } from "../../types"
import { get, set } from "../store"
import { getAnyoneProductForCheck } from "../api/prom"

async function checkPromApiKey() {
  try {
    const res = await getAnyoneProductForCheck()
    switch (res.status) {
      case 200: {
        return true
      }
      default: {
        return false
      }
    }
  } catch (err) {
    return false
  }
}

// GetPromApiKey

export interface GetPromApiKeyResponse {
  promApiKey?: string
  isValid?: boolean
}

export async function getPromApiKeyHandler(
  _: Electron.IpcMainInvokeEvent,
): Promise<Response<GetPromApiKeyResponse>> {
  const promApiKey = get<string>("promApiKey")

  return {
    isSuccess: true,
    data: {
      promApiKey,
      isValid: promApiKey && (await checkPromApiKey()),
    },
  }
}

// SavePromApiKey

export interface SavePromApiKeyRequest {
  promApiKey: string
}

export interface SavePromApiKeyResponse {
  promApiKey: string
  isValid: boolean
}

export async function savePromApiKeyHandler(
  _: Electron.IpcMainInvokeEvent,
  req: SavePromApiKeyRequest,
): Promise<Response<SavePromApiKeyResponse>> {
  if (req.promApiKey.length === 0) {
    return {
      isSuccess: false,
      error: {
        promApiKey: {
          message: "API key is missing",
        },
      },
    }
  }

  set("promApiKey", req.promApiKey)

  return {
    isSuccess: true,
    data: {
      promApiKey: req.promApiKey,
      isValid: await checkPromApiKey(),
    },
  }
}
