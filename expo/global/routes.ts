import { url } from "../../utils/routes";
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
  SEARCH: '/search',
  MODALS: {
    PICK_OUTFIT: '/pick-outfit',
    NEW_OUTFIT: '/new-outfit',
    OUTFIT_ADD_ITEM: '/add-item',
    PICK_USER: '/pick-user',
    UPGRADE: '/upgrade',
    DAILY_STREAK: '/daily-streak',
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
    BROWSER: '/outfit/new/browser',
    NEW: '/outfit/new',
    PATH: '/outfit/[id]',
    ID: (id: string) => `/outfit/${id}` as const,
  },
  COLLECTION: {
    PATH: '/collection',
    SAVED_POSTS: '/collection/saved-posts',
    SAVED_OUTFITS: '/collection/saved-outfits',
  },
  SHARE: {
    POST: (postId: string) => `/p/${postId}`,
    OUTFIT: (outfitId: string) => `/o/${outfitId}`,
    ITEM: (itemId: string) => `/i/${itemId}`,
    USER: (userId: string) => `/u/${userId}`,
  },
  PRESETS: {
    ID: {
      PATH: '/preset/[id]',
    },
    CREATE: {
      PATH: '/preset/create',
      DISCLAIMER: '/preset/create/disclaimer',
      THUMBNAIL: '/preset/create/thumbnail',
    }
  },
  PHOTOSHOOT: {
    NEW: '/photoshoot/create',
    RECAP: '/photoshoot/create/recap',
    GENERATIONS: {
      NEXT: '/photoshoot/generations/next',
      PATH: '/photoshoot/generations/[id]',
      ID: (id: string) => `/photoshoot/generations/${id}` as const,
    }
  },
  USER: {
    PATH: '/user/[id]',
    ID: (id: string) => `/user/${id}` as const,
    FOLLOWERS: '/user/u/[id]/followers',
    FOLLOWING: '/user/u/[id]/following',
  },
  EXTRA: {
    SETINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    AVATAR: {
      PORTRAITS: '/avatar/portraits',
      PROFILE: '/avatar/profile',
      APPEARANCE: '/avatar/appearance',
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
    INDEX: '/welcome/step-1',
    STEP_2: '/welcome/step-2',
    STEP_3: '/welcome/step-3',
    WAIT_LIST: '/welcome/wait-list',
  },
  AUTH: '/auth',
  PRICING: '/pricing',
  REFERRAL: (referralCode: string) => `${WEBSITE.URL}/${referralCode}`,
  ADMIN: {
    BOTS: {
      OUTFITS: {
        EXTRACTOR: '/admin/bots/outfits/extractor',
      }
    }
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