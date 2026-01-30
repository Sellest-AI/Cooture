import { url } from "@utils/routes";
import { WEBSITE } from "./website";

export const SERVER_ROUTE_PATH = '/_next/data';
export const POSTHOG_IGNORED_ROUTES = ['_next/image', '/_next/static', '/api'] as const;

export const ROUTES = {
  HOME: '/',
  TABS: {
    FEED: '/feed',
    NEW: '/new',
  },
  SCAN: '/scan',
  MODALS: {
    PICK_OUTFIT: (params: { nextPath?: string, canSkip?: boolean, itemIds?: string[] }) => url('/pick-outfit', params),
    NEW_OUTFIT: (params: { itemIds?: string[], nextPath?: string, reset?: boolean }) => url('/new-outfit', params),
    OUTFIT_ADD_ITEM: (params: { nextPath?: string, outfitId?: string, itemIds?: string[] }) => url('/add-item', params),
  },
  ITEM: {
    PATH: '/item/[id]',
    ID: (id: string) => `/item/${id}` as const,
  },
  OUTFIT: {
    PATH: '/outfit/[id]',
    ID: (id: string) => `/outfit/${id}` as const,
  },
  PHOTOSHOOT: {
    NEW: '/photoshoot/new' as const,
    PRESETS: '/photoshoot/presets' as const,
    GENERATIONS: {
      ID: (id: string) => `/photoshoot/generations/${id}` as const,
    }
  },
  PROFILE: {
    PATH: '/profile',
    SETTINGS: '/settings',
    GENERATIONS: '/profile/generations',
    OUTFITS: '/profile/outfits',
    SAVED: '/profile/saved',
  },
  WELCOME: {
    INDEX: '/welcome',
    STEP_1: '/welcome/step-1',
    STEP_2: '/welcome/step-2',
    STEP_3: '/welcome/step-3',
  },
  AUTH: '/auth',
  PRICING: '/pricing',
  REFERRAL: (referralCode: string) => `${WEBSITE.URL}/${referralCode}`,
  ADMIN: {
    USERS: (id: string) => `/admin/users/${id}`,
    toString: () => '/admin',
  },
  APP: {
    TOOLS: {
      PRODUCT_PHOTO: {
        NEW: (imageId?: string) => url('/app/tools/product-photo', { productId: imageId }),
        ID: (id: string) => '/app/tools/product-photo/' + id,
      }
    }
  },
  POLICIES: {
    LEGAL_NOTICES: '/policies/legal-notices',
    TERMS_OF_USE: '/policies/terms-of-use',
    PRIVACY_POLICY: '/policies/privacy-policy',
    COOKIES_POLICY: '/policies/cookies-policy',
  },
  EXTERNAL: {
    DISCORD: "TODO",
    INSTAGRAM: "TODO",
    MAIL: "mailto:support@shotly.io"
  }
} as const