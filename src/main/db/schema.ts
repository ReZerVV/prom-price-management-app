import {
  sqliteTable,
  text,
  real,
  integer,
} from "drizzle-orm/sqlite-core"
import { customType } from "drizzle-orm/sqlite-core"

const commaSeparatedArray = customType<{
  data: string[]
  driverData: string
}>({
  dataType() {
    return "text"
  },
  toDriver(value: string[]): string {
    return value.join(",")
  },
  fromDriver(value: string): string[] {
    return value.split(",")
  },
})

export const priceMarkupChangesGroups = sqliteTable(
  "price_markup_changes_groups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    catalogUrls:
      commaSeparatedArray("catalog_urls").notNull(),
    numberOfAllOffers: integer(
      "number_of_all_offers",
    ).notNull(),
  },
)

export const priceMarkupChanges = sqliteTable(
  "price_markup_changes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    changesGroupId: integer("changes_group_id")
      .notNull()
      .references(() => priceMarkupChangesGroups.id, {
        onDelete: "cascade",
      }),
    offerId: text("offer_id").notNull(),
    newPrice: real("new_price").notNull(),
    oldPrice: real("old_price"),
  },
)

export const priceMarkupChangesLogs = sqliteTable(
  "price_markup_changes_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    changesGroupId: integer("changes_group_id")
      .notNull()
      .references(() => priceMarkupChangesGroups.id, {
        onDelete: "cascade",
      }),
    status: text("status")
      .notNull()
      .$type<"success" | "failed">(),
    type: text("type")
      .notNull()
      .$type<"automation" | "custom">(),
    numberOfSuccessfullyChangedOffers: integer(
      "number_of_successfully_changed_offers",
    ),
    createdAt: text("created_at").notNull(),
  },
)

export const automations = sqliteTable("automations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  changesGroupId: integer("changes_group_id")
    .notNull()
    .references(() => priceMarkupChangesGroups.id, {
      onDelete: "cascade",
    }),
  frequency: text("frequency").notNull(),
  startTime: text("start_time").notNull(),
})
