import {
  Automation,
  ChangesGroup,
  Response,
} from "../../../types"

export async function getAutomations(
  page?: number,
  perPage?: number,
): Promise<
  Response<(Automation & { changesGroup: ChangesGroup })[]>
> {
  return (window as any).api.listAutomations({
    page,
    perPage,
  })
}

export async function removeAutomation(
  id: number,
): Promise<Response<null>> {
  return (window as any).api.removeAutomation({
    automationId: id,
  })
}
