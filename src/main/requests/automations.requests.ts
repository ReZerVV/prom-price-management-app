import {
  Automation,
  ChangesGroup,
  Response,
} from "../../types"
import {
  getAutomations,
  scheduler,
} from "../services/automations.service"
import { getChangesGroupById } from "../services/changes.service"

export async function getAutomationsHandler(
  _: Electron.IpcMainInvokeEvent,
): Promise<
  Response<(Automation & { changesGroup: ChangesGroup })[]>
> {
  try {
    const data = getAutomations().map((automation) => ({
      ...automation,
      changesGroup: getChangesGroupById(
        automation.changesGroupId,
      ),
    }))

    return {
      isSuccess: true,
      data,
    }
  } catch {
    return {
      isSuccess: false,
      error: {
        automations: {
          message: "Failed to get automations",
        },
      },
    }
  }
}

export type RemoveAutomationsRequest = {
  automationId: string
}
export async function removeAutomationHandler(
  _: Electron.IpcMainInvokeEvent,
  { automationId }: RemoveAutomationsRequest,
): Promise<Response<null>> {
  try {
    await scheduler.removeAutomation(automationId)
    return {
      isSuccess: true,
    }
  } catch {
    return {
      isSuccess: false,
      error: {
        automation: {
          message: "Failed to remove automations",
        },
      },
    }
  }
}
