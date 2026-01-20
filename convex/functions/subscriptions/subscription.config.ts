import { SUBSCRIPTIONS_NAME } from "../../schema/subscriptions";

export type ProductName = typeof SUBSCRIPTIONS_NAME.type;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Features = {}

export type Subscription = {
  tokensAmount: number,
  creditsAmount: number,
  id: Subscription['name'],
  name: ProductName | 'free',
  features: Features,
}

const FREE: Subscription = {
  tokensAmount: 500000,
  creditsAmount: 90,
  id: 'free',
  name: 'free',
  features: {},
} as const;

const STARTER: Subscription = {
  tokensAmount: 2500000,
  creditsAmount: 1000,
  id: 'starter',
  name: 'starter',
  features: {},

} as const;

const CREATIVE: Subscription = {
  tokensAmount: 6000000,
  creditsAmount: 2400,
  id: 'creative',
  name: 'creative',
  features: {},
} as const;

const PROFESSIONAL: Subscription = {
  tokensAmount: 19000000,
  creditsAmount: 7600,
  id: 'professional',
  name: 'professional',
  features: {},
} as const;

export const SUBSCRIPTIONS = [FREE, STARTER, CREATIVE, PROFESSIONAL] as const;
export const FREE_SUBSCRIPTION = FREE;

