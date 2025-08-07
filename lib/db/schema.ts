import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), //if it is some type its ok or default "folder"

  //storage information
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  //ownership
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id").notNull(), //parent folder id, null for root item

  //flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),
  isStared: boolean("is_stared").default(false).notNull(),

  //Timestamps

  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/*
   => parent: each file or folder can only have one parent
   => children : each folder can have many child files or folder

   THATS WHY THE relation is one to many

*/

export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),
  children: many(files),
}));

// this is just for the typesafety and type suggestions when ever we use the drizzle in any other files
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;
