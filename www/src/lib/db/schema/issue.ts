import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  pgEnum,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { users } from "./user";
import { labelToIssues } from "./label";
import { comments } from "./comment";
import { reactions } from "./reaction";

import type { InferModel } from "drizzle-orm";
import {
  assignActivities,
  changeTitleActivities,
  editLabelsActivities,
  mentionActivities,
  toggleActivities,
} from "./activity";

export const IssueStatuses = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  NOT_PLANNED: "NOT_PLANNED",
} as const;

export const issueStatusEnum = pgEnum("issue_status", [
  "OPEN",
  "CLOSED",
  "NOT_PLANNED",
]);

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default("").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  status_updated_at: timestamp("status_updated_at").defaultNow().notNull(),
  status: issueStatusEnum("status").default(IssueStatuses.OPEN).notNull(),
  author_id: integer("author_id")
    .references(() => users.id)
    .notNull(),
  assignee_id: integer("assignee_id").references(() => users.id),
  is_locked: boolean("is_locked").default(false).notNull(),
});

export const issuesRelations = relations(issues, ({ one, many }) => ({
  author: one(users, {
    fields: [issues.author_id],
    references: [users.id],
    relationName: "author",
  }),
  assignee: one(users, {
    fields: [issues.assignee_id],
    references: [users.id],
    relationName: "assignee",
  }),
  labelToIssues: many(labelToIssues),
  comments: many(comments),
  reactions: many(reactions),
  revisions: many(issueRevisions),
  subcriptions: many(issueUserSubscriptions, {
    relationName: "issue",
  }),
  changeTitleActivities: many(changeTitleActivities),
  toggleActivities: many(toggleActivities),
  mentionnedByActivities: many(mentionActivities, {
    relationName: "mentionnedIssue",
  }),
  mentionnedFromActivities: many(mentionActivities, {
    relationName: "parentIssue",
  }),
  assignActivities: many(assignActivities),
  editLabelsActivities: many(editLabelsActivities),
}));

export const issueRevisions = pgTable("issue_revisions", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  revised_by_id: integer("revised_by_id")
    .references(() => users.id)
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id)
    .notNull(),
});

export const issueRevisionsRelations = relations(issueRevisions, ({ one }) => ({
  revised_by: one(users, {
    fields: [issueRevisions.revised_by_id],
    references: [users.id],
    relationName: "revised_by",
  }),
  issue: one(issues, {
    fields: [issueRevisions.issue_id],
    references: [issues.id],
    relationName: "issue",
  }),
}));

export const issueUserSubscriptions = pgTable("issue_user_subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  issue_id: integer("issue_id")
    .references(() => issues.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const issueUserSubscriptionRelations = relations(
  issueUserSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [issueUserSubscriptions.user_id],
      references: [users.id],
      relationName: "user",
    }),
    issue: one(issues, {
      fields: [issueUserSubscriptions.issue_id],
      references: [issues.id],
      relationName: "issue",
    }),
  })
);

export type Issue = InferModel<typeof issues>;
export type IssueUserSubscription = InferModel<typeof issueUserSubscriptions>;
export type IssueRevision = InferModel<typeof issueRevisions>;
export type IssueStatus = keyof typeof IssueStatuses;
