import { relations } from "drizzle-orm";
import {
  int,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.sql";
import { posts } from "./posts.sql";

export const userBookmarks = mysqlTable(
  "UserBookmarks",
  {
    user_id: varchar("user_id", { length: 100 }).notNull(),
    post_id: varchar("post_id", { length: 36 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.user_id, table.post_id] }),
    };
  }
);

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.user_id],
    references: [users.auth_id],
  }),
  post: one(posts, {
    fields: [userBookmarks.post_id],
    references: [posts.id],
  }),
}));
