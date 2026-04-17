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
    PICK_USER: '/pick-user',
    UPGRADE: '/upgrade',
    DAILY_STREAK: '/daily-streak',
    TURN_TO_VIDEO: '/turn-to-video',
    PREVIEW_ITEM: '/preview-item',
  },
  POST: {
    PATH: '/post/[id]',
    ID: (id: string) => `/post/${id}` as const,
    SETTINGS: (id: string) => `/post/${id}/settings` as const,
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
    SAVED_ITEMS: '/collection/saved-items',
  },
  SHARE: {
    POST: (postId: string) => `/p/${postId}` as const,
    OUTFIT: (outfitId: string) => `/o/${outfitId}` as const,
    ITEM: (itemId: string) => `/i/${itemId}` as const,
    USER: (userId: string) => `/u/${userId}` as const,
  },
  PRESETS: {
    ID: {
      PATH: '/preset/[id]',
      toString: (id: string) => `/preset/${id}` as const,
    },
    CREATE: {
      PATH: '/preset/create',
      DISCLAIMER: '/preset/create/disclaimer',
      THUMBNAIL: '/preset/create/thumbnail',
    }
  },
  GENERATIONS: {
    VIDEO: {
      ID: (id: string) => `/generations/video/${id}` as const,
    },
    PHOTOSHOOT: {
      NEXT: '/photoshoot/generations/next',
      PATH: '/photoshoot/generations/[id]',
      ID: (id: string) => `/photoshoot/generations/${id}` as const,
    }
  },
  PHOTOSHOOT: {
    NEW: '/photoshoot/create',
    RECAP: '/photoshoot/create/recap',
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
  REFERRAL: (referralCode: string) => `${WEBSITE.URL}/${referralCode}` as const,
  ADMIN: {
    BOTS: {
      OUTFITS: {
        EXTRACTOR: '/admin/bots/outfits/extractor',
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