import { appendToArray, get, has, set } from "../store"
import { Automation } from "../../types"

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  )
}

export function createAutomation(
  frequency: string,
  startTime: string,
  changesGroupId: string,
) {
  if (!has("automations")) {
    set("automations", [])
  }

  const id = generateId()

  appendToArray("automations", {
    id,
    frequency,
    startTime,
    changesGroupId,
  })

  return id
}

export function getAutomations() {
  if (!has("automations")) {
    set("automations", [])
  }

  return get<Automation[]>("automations")
}

export function removeAutomation(id: string) {
  if (!has("automations")) {
    set("automations", [])
    return
  }

  set(
    "automations",
    (get("automations") as Automation[]).filter(
      (automation) => automation.id !== id,
    ),
  )
}
