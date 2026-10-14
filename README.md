<p align="center">
  <img src=".github/assets/logo.webp" alt="Cooture logo" width="180" />
</p>

<h1 align="center">Cooture</h1>

<p align="center">
  <strong>Cooture turns the clothes you already own into a digital wardrobe, builds outfits from it,
  and shows you wearing them in AI photoshoots.</strong>
</p>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&logoColor=white" />
  <img alt="Convex" src="https://img.shields.io/badge/Convex-backend-EE342F" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="Platforms" src="https://img.shields.io/badge/iOS%20·%20Android%20·%20Web-555" />
</p>

## 👗 Why

Wardrobe apps make you catalogue every piece and then leave you staring at a list. Try-on apps
only work with clothes from a shop. Cooture starts from your own closet: snap a piece and it is cut
out and tagged for you, combine pieces into outfits, then see yourself wearing them before you get
dressed or share the look.

> [!NOTE]
> **This repository is public for viewing only.** It is not open source. See [License](#-license).

## ✨ What it does

- 📸 **Wardrobe:** photograph an item; its background is removed and an LLM categorises it
- 🧩 **Outfits:** compose items into outfits, or let the app suggest some
- 🎞️ **Photoshoots:** generate images and videos of yourself in an outfit from style presets
- 💬 **Feed:** publish looks, follow people, like, bookmark and complete quests
- 💳 **Credits:** generations spend from a wallet topped up by subscription

## 🧰 Stack

- 📱 **App:** Expo (React Native) with Expo Router and NativeWind, for iOS, Android and web
- 🗄️ **Backend:** Convex (database, functions, auth, workflows, crons)
- 🤖 **AI:** `@convex-dev/agent` and `@convex-dev/rag` through OpenRouter; image and video
  generation on Replicate
- 💸 **Payments:** RevenueCat on mobile, Stripe on web
- ⚛️ **State:** Jotai
- 🔷 **Language:** TypeScript throughout

## 🗂️ Layout

```
app/            Expo Router screens
expo/           app source: hooks, providers, components, the UI system
convex/         schema, procedures, router, workflows, LLM agents and integrations
utils/          code both the app and the backend run
translations/   English and French strings
.readme/        conventions for the app and the backend
_architecture/  architecture audit of this codebase
```

## 🚀 Running it locally

Requires Node 22 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in the EXPO_PUBLIC_* keys
pnpm convex:dev              # keep it running
pnpm start                   # in a second terminal
```

🔐 The backend reads its secrets (OpenRouter, Replicate, Stripe, RevenueCat, S3 storage) from the
Convex deployment, not from `.env.local`. The client keys are validated in [env.js](env.js).

## 📚 Documentation

- 🧭 [.readme/ROOT.md](.readme/ROOT.md): project overview and conventions
- 🗄️ [convex/README.md](convex/README.md): the backend
- 🏗️ [_architecture/README.md](_architecture/README.md): how the code is actually built, and where
  it falls short

## 📄 License

Copyright (c) 2026 Franck Desfrançais. All rights reserved.

The source is published so it can be read. It may not be used, copied, modified or redistributed
without written permission. The full terms are in [LICENSE](LICENSE).
