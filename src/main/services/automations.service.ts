import { automations } from "../db/schema"
import { getDB } from "../db"
import {
  createChangesLog,
  getAllChangesFromGroup,
} from "./changes.service"
import { updateProductsPrice } from "../api/prom"
import cron, { ScheduledTask } from "node-cron"
import { Automation } from "../../types"
import { eq } from "drizzle-orm"

export async function getAllAutomations() {
  return getDB().select().from(automations)
}

async function createAutomation(
  frequency: string,
  startTime: string,
  changesGroupId: number,
) {
  const [{ id }] = await getDB()
    .insert(automations)
    .values({
      frequency,
      startTime,
      changesGroupId,
    })
    .returning({
      id: automations.id,
    })
  return id
}

async function removeAutomation(id: number) {
  await getDB()
    .delete(automations)
    .where(eq(automations.id, id))
}

async function startAutomation(changesGroupId: number) {
  try {
    const offerChanges =
      await getAllChangesFromGroup(changesGroupId)

    console.log(offerChanges)

    const offerChangeResults =
      await updateProductsPrice(offerChanges)

    const numberOfSuccessfullyChangedOffers =
      offerChangeResults.filter(
        (result) => result.isSuccess,
      ).length
    await createChangesLog(
      changesGroupId,
      "success",
      "automation",
      numberOfSuccessfullyChangedOffers,
    )

    return true
  } catch (e) {
    console.error(e)
    await createChangesLog(
      changesGroupId,
      "failed",
      "automation",
    )

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
    const automations = await getAllAutomations()

    for (const automation of automations) {
      const task = cron.schedule(
        buildCronFromAutomation(
          automation.frequency,
          automation.startTime,
        ),
        () => startAutomation(automation.changesGroupId),
      )
      this.jobs.set(automation.id.toString(), task)
    }
  }

  async addAutomation(automation: Omit<Automation, "id">) {
    console.log(automation)
    const automationId = await createAutomation(
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
    this.jobs.set(automationId.toString(), task)
  }

  async removeAutomation(id: number) {
    await removeAutomation(id)
    const task = this.jobs.get(id.toString())
    if (task) {
      task.stop()
      this.jobs.delete(id.toString())
    }
  }

  listAutomations() {
    return Array.from(this.jobs.keys())
  }
}

export const scheduler = new Scheduler()
