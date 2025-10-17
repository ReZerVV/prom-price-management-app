import {
  createChangesLog,
  getAllChangesFromGroup,
} from "./changes.service"
import { updateProductsPrice } from "../api/prom"
import cron, { ScheduledTask } from "node-cron"
import { Automation } from "../../types"
import {
  createAutomation,
  getAutomations,
  removeAutomation,
} from "../repositories/automations.repository"

async function startAutomation(changesGroupId: string) {
  try {
    const offerChanges =
      getAllChangesFromGroup(changesGroupId)

    console.log(offerChanges)

    const offerChangeResults =
      await updateProductsPrice(offerChanges)

    const numberOfSuccessfullyChangedOffers =
      offerChangeResults.filter(
        (result) => result.isSuccess,
      ).length

    createChangesLog(
      changesGroupId,
      "success",
      "automation",
      numberOfSuccessfullyChangedOffers,
    )

    return true
  } catch (e) {
    console.error(e)
    createChangesLog(changesGroupId, "failed", "automation")

    return false
  }
}

function buildCronFromAutomation(
  frequency: string,
  startTime: string,
) {
  const [hoursStr, minutesStr] = startTime.split(":")
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  const seconds = 0

  switch (frequency) {
    case "daily":
      return `${seconds} ${minutes} ${hours} * * *`
    default:
      throw new Error(`Unsupported frequency: ${frequency}`)
  }
}

class Scheduler {
  private jobs = new Map<string, ScheduledTask>()

  async loadAutomations() {
    const automations = getAutomations()

    for (const automation of automations) {
      const task = cron.schedule(
        buildCronFromAutomation(
          automation.frequency,
          automation.startTime,
        ),
        () => startAutomation(automation.changesGroupId),
      )
      this.jobs.set(automation.id, task)
    }
  }

  async addAutomation(automation: Omit<Automation, "id">) {
    console.log(automation)
    const automationId = createAutomation(
      automation.frequency,
      automation.startTime,
      automation.changesGroupId,
    )

    const task = cron.schedule(
      buildCronFromAutomation(
        automation.frequency,
        automation.startTime,
      ),
      () => startAutomation(automation.changesGroupId),
    )
    this.jobs.set(automationId, task)
  }

  async removeAutomation(id: string) {
    removeAutomation(id)
    const task = this.jobs.get(id)
    if (task) {
      task.stop()
      this.jobs.delete(id)
    }
  }

  listAutomations() {
    return Array.from(this.jobs.keys())
  }
}

export const scheduler = new Scheduler()

export { getAutomations }
