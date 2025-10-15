import {
  Automation,
  ChangesGroup,
  Response,
} from "../../types"
import {
  getAllAutomations,
  scheduler,
} from "../services/automations.service"
import { getChangesGroupById } from "../services/changes.service"

export async function getAutomationsHandler(
  _: Electron.IpcMainInvokeEvent,
): Promise<
  Response<(Automation & { changesGroup: ChangesGroup })[]>
> {
  try {
    const data = await getAllAutomations().then(
      (automations) =>
        Promise.all(
          automations.map(async (automation) => ({
            ...automation,
            changesGroup: await getChangesGroupById(
              automation.changesGroupId,
            ),
          })),
        ),
    )

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
  automationId: number
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
