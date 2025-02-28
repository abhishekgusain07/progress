// src/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean, primaryKey, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  email: text('email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  reactivatedAt: timestamp('reactivated_at', { withTimezone: true }),
}, (table) => {
  return {
    // Foreign key to auth.users is handled at DB level, not in Drizzle schema
  };
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hasCompletedOnboarding: boolean('has_completed_onboarding').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdUnique: unique('user_preferences_user_id_key').on(table.userId),
  };
});

export const userTrials = pgTable('user_trials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  trialStartTime: timestamp('trial_start_time', { withTimezone: true }).defaultNow(),
  trialEndTime: timestamp('trial_end_time', { withTimezone: true }).notNull(),
  isTrialUsed: boolean('is_trial_used').default(false),
}, (table) => {
  return {
    userIdUnique: unique('user_trials_user_id_key').on(table.userId),
  };
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status'),
  priceId: text('price_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  userPreferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  userTrials: one(userTrials, {
    fields: [users.id],
    references: [userTrials.userId],
  }),
  subscriptions: many(subscriptions),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userTrialsRelations = relations(userTrials, ({ one }) => ({
  user: one(users, {
    fields: [userTrials.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));