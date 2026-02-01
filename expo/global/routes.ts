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
    PICK_OUTFIT: '/pick-outfit' as const,
    NEW_OUTFIT: '/new-outfit' as const,
    OUTFIT_ADD_ITEM: '/add-item' as const,
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
    NEW: '/photoshoot/create' as const,
    PRESETS: '/photoshoot/create/presets' as const,
    RECAP: '/photoshoot/create/recap' as const,
    GENERATIONS: {
      PATH: '/photoshoot/generations/[id]',
      ID: (id: string) => `/photoshoot/generations/${id}` as const,
    }
  },
  SETTINGS: {
    PATH: '/settings',
    UPDATE_PORTRAITS: '/settings/update-portraits' as const,
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