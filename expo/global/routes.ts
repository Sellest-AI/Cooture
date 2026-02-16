import { url } from "@utils/routes";
import { WEBSITE } from "./website";

export const SERVER_ROUTE_PATH = '/_next/data';
export const POSTHOG_IGNORED_ROUTES = ['_next/image', '/_next/static', '/api'] as const;

export const ROUTES = {
  HOME: '/',
  TABS: {
    FEED: '/feed',
    NEW: '/new',
    DISCOVER: '/explore',
  },
  SCAN: '/scan',
  MODALS: {
    PICK_OUTFIT: '/pick-outfit',
    NEW_OUTFIT: '/new-outfit',
    OUTFIT_ADD_ITEM: '/add-item',
    PICK_USER: '/pick-user',
    UPGRADE: '/upgrade',
  },
  POST: {
    PATH: '/post/[id]',
    ID: (id: string) => `/post/${id}` as const,
  },
  ITEM: {
    PATH: '/item/[id]',
    ID: (id: string) => `/item/${id}` as const,
  },
  OUTFIT: {
    PATH: '/outfit/[id]',
    ID: (id: string) => `/outfit/${id}` as const,
  },
  COLLECTION: {
    PATH: '/collection',
    SAVED_POSTS: '/collection/saved-posts',
    SAVED_OUTFITS: '/collection/saved-outfits',
  },
  PHOTOSHOOT: {
    NEW: '/photoshoot/create',
    PRESETS: '/photoshoot/create/presets',
    RECAP: '/photoshoot/create/recap',
    GENERATIONS: {
      NEXT: '/photoshoot/generations/next',
      PATH: '/photoshoot/generations/[id]',
      ID: (id: string) => `/photoshoot/generations/${id}` as const,
    }
  },
  USER: {
    PATH: '/users/[id]',
    ID: (id: string) => `/users/${id}` as const,
    FOLLOWERS: '/users/u/[id]/followers',
    FOLLOWING: '/users/u/[id]/following',
  },
  EXTRA: {
    SETINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    AVATAR: {
      UPDATE_PORTRAITS: '/avatar/update-portraits',
      UPDATE_HEIGHT: '/update-height',
    }
  },
  PROFILE: {
    PATH: '/profile',
    SETTINGS: '/settings',
    GENERATIONS: '/profile/generations',
    OUTFITS: '/profile/outfits',
    ITEMS: '/profile/items',
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