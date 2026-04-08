/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as cron_feedRecentUpdate from "../cron/feedRecentUpdate.js";
import type * as crons from "../crons.js";
import type * as env from "../env.js";
import type * as functions_credits_canPay from "../functions/credits/canPay.js";
import type * as functions_credits_createUserWallet from "../functions/credits/createUserWallet.js";
import type * as functions_credits_deductCredits from "../functions/credits/deductCredits.js";
import type * as functions_credits_getUserWallet from "../functions/credits/getUserWallet.js";
import type * as functions_credits_grantCredits from "../functions/credits/grantCredits.js";
import type * as functions_credits_index from "../functions/credits/index.js";
import type * as functions_feed_index from "../functions/feed/index.js";
import type * as functions_feed_updateFeedScore from "../functions/feed/updateFeedScore.js";
import type * as functions_generations_createPrediction from "../functions/generations/createPrediction.js";
import type * as functions_generations_getGenerationDetails from "../functions/generations/getGenerationDetails.js";
import type * as functions_generations_getGenerationMax from "../functions/generations/getGenerationMax.js";
import type * as functions_generations_getPrediction from "../functions/generations/getPrediction.js";
import type * as functions_generations_index from "../functions/generations/index.js";
import type * as functions_images_getImage from "../functions/images/getImage.js";
import type * as functions_images_index from "../functions/images/index.js";
import type * as functions_images_saveImage from "../functions/images/saveImage.js";
import type * as functions_items_createItem from "../functions/items/createItem.js";
import type * as functions_items_extractPosition from "../functions/items/extractPosition.js";
import type * as functions_items_getItem from "../functions/items/getItem.js";
import type * as functions_items_index from "../functions/items/index.js";
import type * as functions_items_searchItems from "../functions/items/searchItems.js";
import type * as functions_notifications_getNotificationDetails from "../functions/notifications/getNotificationDetails.js";
import type * as functions_notifications_index from "../functions/notifications/index.js";
import type * as functions_notifications_readNotification from "../functions/notifications/readNotification.js";
import type * as functions_notifications_registerToken from "../functions/notifications/registerToken.js";
import type * as functions_notifications_saveNotification from "../functions/notifications/saveNotification.js";
import type * as functions_outfits_getBackgroundColor from "../functions/outfits/getBackgroundColor.js";
import type * as functions_outfits_getOutfit from "../functions/outfits/getOutfit.js";
import type * as functions_outfits_index from "../functions/outfits/index.js";
import type * as functions_outfits_isOutfitNFSW from "../functions/outfits/isOutfitNFSW.js";
import type * as functions_presets_getPreset from "../functions/presets/getPreset.js";
import type * as functions_presets_index from "../functions/presets/index.js";
import type * as functions_presets_sanitizePresets from "../functions/presets/sanitizePresets.js";
import type * as functions_quests_index from "../functions/quests/index.js";
import type * as functions_quests_updateQuest from "../functions/quests/updateQuest.js";
import type * as functions_subscriptions_getUserSubscription from "../functions/subscriptions/getUserSubscription.js";
import type * as functions_subscriptions_index from "../functions/subscriptions/index.js";
import type * as functions_subscriptions_isSubscriptionActive from "../functions/subscriptions/isSubscriptionActive.js";
import type * as functions_users_getAccount from "../functions/users/getAccount.js";
import type * as functions_users_getAppearance from "../functions/users/getAppearance.js";
import type * as functions_users_index from "../functions/users/index.js";
import type * as functions_users_isAuthorized from "../functions/users/isAuthorized.js";
import type * as functions_users_isPremium from "../functions/users/isPremium.js";
import type * as functions_videos_getVideo from "../functions/videos/getVideo.js";
import type * as functions_videos_index from "../functions/videos/index.js";
import type * as functions_waitlist_index from "../functions/waitlist/index.js";
import type * as functions_waitlist_updateWaitlist from "../functions/waitlist/updateWaitlist.js";
import type * as http from "../http.js";
import type * as http_replicate from "../http/replicate.js";
import type * as http_revenuecat from "../http/revenuecat.js";
import type * as http_runpod_generateVideo from "../http/runpod/generateVideo.js";
import type * as http_runpod_removeBackground from "../http/runpod/removeBackground.js";
import type * as lib_image_index from "../lib/image/index.js";
import type * as lib_image_node from "../lib/image/node.js";
import type * as lib_image_sanitizeImage from "../lib/image/sanitizeImage.js";
import type * as lib_nanoid_index from "../lib/nanoid/index.js";
import type * as lib_replicate_node from "../lib/replicate/node.js";
import type * as lib_replicate_utils from "../lib/replicate/utils.js";
import type * as lib_runpod_generateVideo_index from "../lib/runpod/generateVideo/index.js";
import type * as lib_runpod_generateVideo_run from "../lib/runpod/generateVideo/run.js";
import type * as lib_runpod_generateVideo_workflow from "../lib/runpod/generateVideo/workflow.js";
import type * as lib_runpod_index from "../lib/runpod/index.js";
import type * as lib_runpod_node from "../lib/runpod/node.js";
import type * as lib_runpod_removeBackground_index from "../lib/runpod/removeBackground/index.js";
import type * as lib_runpod_removeBackground_run from "../lib/runpod/removeBackground/run.js";
import type * as lib_runpod_run from "../lib/runpod/run.js";
import type * as lib_runpod_types from "../lib/runpod/types.js";
import type * as lib_s3_node from "../lib/s3/node.js";
import type * as lib_stripe_createCustomer from "../lib/stripe/createCustomer.js";
import type * as lib_stripe_getCurrentBillingPeriod from "../lib/stripe/getCurrentBillingPeriod.js";
import type * as lib_stripe_getSubscription from "../lib/stripe/getSubscription.js";
import type * as lib_stripe_index from "../lib/stripe/index.js";
import type * as lib_stripe_promotionCode from "../lib/stripe/promotionCode.js";
import type * as lib_stripe_setDefaultPaymentMethod from "../lib/stripe/setDefaultPaymentMethod.js";
import type * as lib_stripe_utils from "../lib/stripe/utils.js";
import type * as llm_agents_default from "../llm/agents/default.js";
import type * as llm_config_embedding from "../llm/config/embedding.js";
import type * as llm_config_index from "../llm/config/index.js";
import type * as llm_config_models from "../llm/config/models.js";
import type * as llm_config_providers from "../llm/config/providers.js";
import type * as llm_rag_rag from "../llm/rag/rag.js";
import type * as llm_tools_faceGenerator from "../llm/tools/faceGenerator.js";
import type * as llm_tools_imageCategorizer from "../llm/tools/imageCategorizer.js";
import type * as llm_tools_itemCategorizer from "../llm/tools/itemCategorizer.js";
import type * as llm_tools_photoshootPrompter from "../llm/tools/photoshootPrompter.js";
import type * as llm_tools_presetCreator from "../llm/tools/presetCreator.js";
import type * as llm_tools_profilePictureGenerator from "../llm/tools/profilePictureGenerator.js";
import type * as llm_tools_videoPrompter from "../llm/tools/videoPrompter.js";
import type * as llm_triggers_generateDepthMap from "../llm/triggers/generateDepthMap.js";
import type * as llm_triggers_generateFace from "../llm/triggers/generateFace.js";
import type * as llm_triggers_generateVideo from "../llm/triggers/generateVideo.js";
import type * as llm_triggers_itemCategorizer from "../llm/triggers/itemCategorizer.js";
import type * as llm_triggers_photoshoot from "../llm/triggers/photoshoot.js";
import type * as llm_triggers_presetCreator from "../llm/triggers/presetCreator.js";
import type * as llm_triggers_presetPreview from "../llm/triggers/presetPreview.js";
import type * as llm_triggers_removeBackground from "../llm/triggers/removeBackground.js";
import type * as llm_utils_createTool from "../llm/utils/createTool.js";
import type * as llm_utils_index from "../llm/utils/index.js";
import type * as llm_utils_photoshoot_index from "../llm/utils/photoshoot/index.js";
import type * as llm_utils_photoshoot_jsonCreator from "../llm/utils/photoshoot/jsonCreator.js";
import type * as llm_utils_photoshoot_toMarkdown from "../llm/utils/photoshoot/toMarkdown.js";
import type * as llm_utils_sanitizeAiText from "../llm/utils/sanitizeAiText.js";
import type * as llm_utils_usageHandler from "../llm/utils/usageHandler.js";
import type * as llm_utils_wrapAgent from "../llm/utils/wrapAgent.js";
import type * as migrations from "../migrations.js";
import type * as procedures from "../procedures.js";
import type * as router_admin_bots_createIdentity from "../router/admin/bots/createIdentity.js";
import type * as router_admin_bots_createOne from "../router/admin/bots/createOne.js";
import type * as router_admin_bots_createTestAccount from "../router/admin/bots/createTestAccount.js";
import type * as router_admin_bots_crons from "../router/admin/bots/crons.js";
import type * as router_admin_bots_getAll from "../router/admin/bots/getAll.js";
import type * as router_admin_bots_getWaiting from "../router/admin/bots/getWaiting.js";
import type * as router_admin_config_getConfig from "../router/admin/config/getConfig.js";
import type * as router_admin_config_initConfig from "../router/admin/config/initConfig.js";
import type * as router_admin_outfits_regenerateCovers from "../router/admin/outfits/regenerateCovers.js";
import type * as router_admin_presets_findByName from "../router/admin/presets/findByName.js";
import type * as router_admin_presets_repairOne from "../router/admin/presets/repairOne.js";
import type * as router_admin_users_approveWaitlist from "../router/admin/users/approveWaitlist.js";
import type * as router_auth_getTestAccount from "../router/auth/getTestAccount.js";
import type * as router_auth_linkStripeSubscription from "../router/auth/linkStripeSubscription.js";
import type * as router_auth_postCreateOrUpdate from "../router/auth/postCreateOrUpdate.js";
import type * as router_collection_getBookmarked from "../router/collection/getBookmarked.js";
import type * as router_collection_getBookmarks from "../router/collection/getBookmarks.js";
import type * as router_collection_toggleBookmark from "../router/collection/toggleBookmark.js";
import type * as router_credits_canPay from "../router/credits/canPay.js";
import type * as router_credits_claimDaily from "../router/credits/claimDaily.js";
import type * as router_credits_deductCredits from "../router/credits/deductCredits.js";
import type * as router_credits_getCost from "../router/credits/getCost.js";
import type * as router_credits_getTransactionsPaginated from "../router/credits/getTransactionsPaginated.js";
import type * as router_credits_getUserWallet from "../router/credits/getUserWallet.js";
import type * as router_credits_grantCredits from "../router/credits/grantCredits.js";
import type * as router_credits_refundCredits from "../router/credits/refundCredits.js";
import type * as router_feed_getFromOutfit from "../router/feed/getFromOutfit.js";
import type * as router_feed_getFromPreset from "../router/feed/getFromPreset.js";
import type * as router_feed_getPaginated from "../router/feed/getPaginated.js";
import type * as router_generations_autoRefund from "../router/generations/autoRefund.js";
import type * as router_generations_createOne from "../router/generations/createOne.js";
import type * as router_generations_getAll from "../router/generations/getAll.js";
import type * as router_generations_getFromPrediction from "../router/generations/getFromPrediction.js";
import type * as router_generations_getOne from "../router/generations/getOne.js";
import type * as router_generations_getPaginated from "../router/generations/getPaginated.js";
import type * as router_generations_getUser from "../router/generations/getUser.js";
import type * as router_generations_newPredictions from "../router/generations/newPredictions.js";
import type * as router_generations_publishRest from "../router/generations/publishRest.js";
import type * as router_generations_updatePrediction from "../router/generations/updatePrediction.js";
import type * as router_items_createOne from "../router/items/createOne.js";
import type * as router_items_deleteOne from "../router/items/deleteOne.js";
import type * as router_items_editOne from "../router/items/editOne.js";
import type * as router_items_getAll from "../router/items/getAll.js";
import type * as router_items_getFromUser from "../router/items/getFromUser.js";
import type * as router_items_getMany from "../router/items/getMany.js";
import type * as router_items_getOne from "../router/items/getOne.js";
import type * as router_items_getPaginated from "../router/items/getPaginated.js";
import type * as router_items_replaceImage from "../router/items/replaceImage.js";
import type * as router_items_searchMany from "../router/items/searchMany.js";
import type * as router_likes_getLiked from "../router/likes/getLiked.js";
import type * as router_likes_getLikes from "../router/likes/getLikes.js";
import type * as router_likes_toggleLike from "../router/likes/toggleLike.js";
import type * as router_notifications_getPaginated from "../router/notifications/getPaginated.js";
import type * as router_notifications_getUnread from "../router/notifications/getUnread.js";
import type * as router_notifications_readNotifications from "../router/notifications/readNotifications.js";
import type * as router_notifications_registerPushToken from "../router/notifications/registerPushToken.js";
import type * as router_notifications_sendPushNotification from "../router/notifications/sendPushNotification.js";
import type * as router_notifications_sendPushNotificationSteps from "../router/notifications/sendPushNotificationSteps.js";
import type * as router_outfits_createOne from "../router/outfits/createOne.js";
import type * as router_outfits_deleteOne from "../router/outfits/deleteOne.js";
import type * as router_outfits_editOne from "../router/outfits/editOne.js";
import type * as router_outfits_getAll from "../router/outfits/getAll.js";
import type * as router_outfits_getFromUser from "../router/outfits/getFromUser.js";
import type * as router_outfits_getLatest from "../router/outfits/getLatest.js";
import type * as router_outfits_getOne from "../router/outfits/getOne.js";
import type * as router_outfits_searchMany from "../router/outfits/searchMany.js";
import type * as router_outfits_updateCover from "../router/outfits/updateCover.js";
import type * as router_outfits_updateCoverInternal from "../router/outfits/updateCoverInternal.js";
import type * as router_outfits_wearCount from "../router/outfits/wearCount.js";
import type * as router_presets_createOne from "../router/presets/createOne.js";
import type * as router_presets_deleteOne from "../router/presets/deleteOne.js";
import type * as router_presets_getByCategory from "../router/presets/getByCategory.js";
import type * as router_presets_getByUser from "../router/presets/getByUser.js";
import type * as router_presets_getCategories from "../router/presets/getCategories.js";
import type * as router_presets_getMany from "../router/presets/getMany.js";
import type * as router_presets_getOne from "../router/presets/getOne.js";
import type * as router_presets_recreateCount from "../router/presets/recreateCount.js";
import type * as router_presets_searchMany from "../router/presets/searchMany.js";
import type * as router_presets_updateOne from "../router/presets/updateOne.js";
import type * as router_quests_getAll from "../router/quests/getAll.js";
import type * as router_quests_getOne from "../router/quests/getOne.js";
import type * as router_quests_initAll from "../router/quests/initAll.js";
import type * as router_quests_updateOne from "../router/quests/updateOne.js";
import type * as router_storage_images_deleteOne from "../router/storage/images/deleteOne.js";
import type * as router_storage_images_deleteOneMutationInternal from "../router/storage/images/deleteOneMutationInternal.js";
import type * as router_storage_images_getLatest from "../router/storage/images/getLatest.js";
import type * as router_storage_images_getMany from "../router/storage/images/getMany.js";
import type * as router_storage_images_getOne from "../router/storage/images/getOne.js";
import type * as router_storage_images_saveMany from "../router/storage/images/saveMany.js";
import type * as router_storage_images_saveSizes from "../router/storage/images/saveSizes.js";
import type * as router_storage_images_uploadMany from "../router/storage/images/uploadMany.js";
import type * as router_storage_images_uploadOne from "../router/storage/images/uploadOne.js";
import type * as router_storage_images_uploadSizes from "../router/storage/images/uploadSizes.js";
import type * as router_storage_videos_deleteOne from "../router/storage/videos/deleteOne.js";
import type * as router_storage_videos_deleteOneMutationInternal from "../router/storage/videos/deleteOneMutationInternal.js";
import type * as router_storage_videos_getMany from "../router/storage/videos/getMany.js";
import type * as router_storage_videos_getOne from "../router/storage/videos/getOne.js";
import type * as router_storage_videos_saveOne from "../router/storage/videos/saveOne.js";
import type * as router_storage_videos_uploadOne from "../router/storage/videos/uploadOne.js";
import type * as router_stripe_billingPortal from "../router/stripe/billingPortal.js";
import type * as router_stripe_cancelDbSubscription from "../router/stripe/cancelDbSubscription.js";
import type * as router_stripe_createCheckoutUrl from "../router/stripe/createCheckoutUrl.js";
import type * as router_stripe_createDbSubscription from "../router/stripe/createDbSubscription.js";
import type * as router_stripe_createServerSubscription from "../router/stripe/createServerSubscription.js";
import type * as router_subscriptions_cancelSubscription from "../router/subscriptions/cancelSubscription.js";
import type * as router_subscriptions_createFreeSubscription from "../router/subscriptions/createFreeSubscription.js";
import type * as router_subscriptions_createSubscription from "../router/subscriptions/createSubscription.js";
import type * as router_subscriptions_endOne from "../router/subscriptions/endOne.js";
import type * as router_subscriptions_getUserSubscription from "../router/subscriptions/getUserSubscription.js";
import type * as router_subscriptions_updateSubscriptionStatus from "../router/subscriptions/updateSubscriptionStatus.js";
import type * as router_users_checkUsername from "../router/users/checkUsername.js";
import type * as router_users_deleteAccount from "../router/users/deleteAccount.js";
import type * as router_users_follows_checkFollowing from "../router/users/follows/checkFollowing.js";
import type * as router_users_follows_getFollowStats from "../router/users/follows/getFollowStats.js";
import type * as router_users_follows_getFollowersPaginated from "../router/users/follows/getFollowersPaginated.js";
import type * as router_users_follows_getFollowingPaginated from "../router/users/follows/getFollowingPaginated.js";
import type * as router_users_follows_getRelatedPaginated from "../router/users/follows/getRelatedPaginated.js";
import type * as router_users_follows_toggleFollow from "../router/users/follows/toggleFollow.js";
import type * as router_users_getAccount from "../router/users/getAccount.js";
import type * as router_users_getAppearance from "../router/users/getAppearance.js";
import type * as router_users_getFromStripeId from "../router/users/getFromStripeId.js";
import type * as router_users_searchMany from "../router/users/searchMany.js";
import type * as router_users_upsertAppearance from "../router/users/upsertAppearance.js";
import type * as router_users_upsertImage from "../router/users/upsertImage.js";
import type * as router_users_upsertUsername from "../router/users/upsertUsername.js";
import type * as router_waitlist_enterCode from "../router/waitlist/enterCode.js";
import type * as router_waitlist_generateCodes from "../router/waitlist/generateCodes.js";
import type * as router_waitlist_getCodes from "../router/waitlist/getCodes.js";
import type * as router_waitlist_getStatistics from "../router/waitlist/getStatistics.js";
import type * as schema_auth from "../schema/auth.js";
import type * as schema_collection from "../schema/collection.js";
import type * as schema_config from "../schema/config.js";
import type * as schema_constants from "../schema/constants.js";
import type * as schema_feed from "../schema/feed.js";
import type * as schema_follows from "../schema/follows.js";
import type * as schema_generations from "../schema/generations.js";
import type * as schema_images from "../schema/images.js";
import type * as schema_items from "../schema/items.js";
import type * as schema_likes from "../schema/likes.js";
import type * as schema_notifications from "../schema/notifications.js";
import type * as schema_outfits from "../schema/outfits.js";
import type * as schema_presets from "../schema/presets.js";
import type * as schema_quests from "../schema/quests.js";
import type * as schema_subscriptions from "../schema/subscriptions.js";
import type * as schema_users from "../schema/users.js";
import type * as schema_videos from "../schema/videos.js";
import type * as schema_waitlist from "../schema/waitlist.js";
import type * as schema_wallets from "../schema/wallets.js";
import type * as utils_isAuthorized from "../utils/isAuthorized.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "cron/feedRecentUpdate": typeof cron_feedRecentUpdate;
  crons: typeof crons;
  env: typeof env;
  "functions/credits/canPay": typeof functions_credits_canPay;
  "functions/credits/createUserWallet": typeof functions_credits_createUserWallet;
  "functions/credits/deductCredits": typeof functions_credits_deductCredits;
  "functions/credits/getUserWallet": typeof functions_credits_getUserWallet;
  "functions/credits/grantCredits": typeof functions_credits_grantCredits;
  "functions/credits/index": typeof functions_credits_index;
  "functions/feed/index": typeof functions_feed_index;
  "functions/feed/updateFeedScore": typeof functions_feed_updateFeedScore;
  "functions/generations/createPrediction": typeof functions_generations_createPrediction;
  "functions/generations/getGenerationDetails": typeof functions_generations_getGenerationDetails;
  "functions/generations/getGenerationMax": typeof functions_generations_getGenerationMax;
  "functions/generations/getPrediction": typeof functions_generations_getPrediction;
  "functions/generations/index": typeof functions_generations_index;
  "functions/images/getImage": typeof functions_images_getImage;
  "functions/images/index": typeof functions_images_index;
  "functions/images/saveImage": typeof functions_images_saveImage;
  "functions/items/createItem": typeof functions_items_createItem;
  "functions/items/extractPosition": typeof functions_items_extractPosition;
  "functions/items/getItem": typeof functions_items_getItem;
  "functions/items/index": typeof functions_items_index;
  "functions/items/searchItems": typeof functions_items_searchItems;
  "functions/notifications/getNotificationDetails": typeof functions_notifications_getNotificationDetails;
  "functions/notifications/index": typeof functions_notifications_index;
  "functions/notifications/readNotification": typeof functions_notifications_readNotification;
  "functions/notifications/registerToken": typeof functions_notifications_registerToken;
  "functions/notifications/saveNotification": typeof functions_notifications_saveNotification;
  "functions/outfits/getBackgroundColor": typeof functions_outfits_getBackgroundColor;
  "functions/outfits/getOutfit": typeof functions_outfits_getOutfit;
  "functions/outfits/index": typeof functions_outfits_index;
  "functions/outfits/isOutfitNFSW": typeof functions_outfits_isOutfitNFSW;
  "functions/presets/getPreset": typeof functions_presets_getPreset;
  "functions/presets/index": typeof functions_presets_index;
  "functions/presets/sanitizePresets": typeof functions_presets_sanitizePresets;
  "functions/quests/index": typeof functions_quests_index;
  "functions/quests/updateQuest": typeof functions_quests_updateQuest;
  "functions/subscriptions/getUserSubscription": typeof functions_subscriptions_getUserSubscription;
  "functions/subscriptions/index": typeof functions_subscriptions_index;
  "functions/subscriptions/isSubscriptionActive": typeof functions_subscriptions_isSubscriptionActive;
  "functions/users/getAccount": typeof functions_users_getAccount;
  "functions/users/getAppearance": typeof functions_users_getAppearance;
  "functions/users/index": typeof functions_users_index;
  "functions/users/isAuthorized": typeof functions_users_isAuthorized;
  "functions/users/isPremium": typeof functions_users_isPremium;
  "functions/videos/getVideo": typeof functions_videos_getVideo;
  "functions/videos/index": typeof functions_videos_index;
  "functions/waitlist/index": typeof functions_waitlist_index;
  "functions/waitlist/updateWaitlist": typeof functions_waitlist_updateWaitlist;
  http: typeof http;
  "http/replicate": typeof http_replicate;
  "http/revenuecat": typeof http_revenuecat;
  "http/runpod/generateVideo": typeof http_runpod_generateVideo;
  "http/runpod/removeBackground": typeof http_runpod_removeBackground;
  "lib/image/index": typeof lib_image_index;
  "lib/image/node": typeof lib_image_node;
  "lib/image/sanitizeImage": typeof lib_image_sanitizeImage;
  "lib/nanoid/index": typeof lib_nanoid_index;
  "lib/replicate/node": typeof lib_replicate_node;
  "lib/replicate/utils": typeof lib_replicate_utils;
  "lib/runpod/generateVideo/index": typeof lib_runpod_generateVideo_index;
  "lib/runpod/generateVideo/run": typeof lib_runpod_generateVideo_run;
  "lib/runpod/generateVideo/workflow": typeof lib_runpod_generateVideo_workflow;
  "lib/runpod/index": typeof lib_runpod_index;
  "lib/runpod/node": typeof lib_runpod_node;
  "lib/runpod/removeBackground/index": typeof lib_runpod_removeBackground_index;
  "lib/runpod/removeBackground/run": typeof lib_runpod_removeBackground_run;
  "lib/runpod/run": typeof lib_runpod_run;
  "lib/runpod/types": typeof lib_runpod_types;
  "lib/s3/node": typeof lib_s3_node;
  "lib/stripe/createCustomer": typeof lib_stripe_createCustomer;
  "lib/stripe/getCurrentBillingPeriod": typeof lib_stripe_getCurrentBillingPeriod;
  "lib/stripe/getSubscription": typeof lib_stripe_getSubscription;
  "lib/stripe/index": typeof lib_stripe_index;
  "lib/stripe/promotionCode": typeof lib_stripe_promotionCode;
  "lib/stripe/setDefaultPaymentMethod": typeof lib_stripe_setDefaultPaymentMethod;
  "lib/stripe/utils": typeof lib_stripe_utils;
  "llm/agents/default": typeof llm_agents_default;
  "llm/config/embedding": typeof llm_config_embedding;
  "llm/config/index": typeof llm_config_index;
  "llm/config/models": typeof llm_config_models;
  "llm/config/providers": typeof llm_config_providers;
  "llm/rag/rag": typeof llm_rag_rag;
  "llm/tools/faceGenerator": typeof llm_tools_faceGenerator;
  "llm/tools/imageCategorizer": typeof llm_tools_imageCategorizer;
  "llm/tools/itemCategorizer": typeof llm_tools_itemCategorizer;
  "llm/tools/photoshootPrompter": typeof llm_tools_photoshootPrompter;
  "llm/tools/presetCreator": typeof llm_tools_presetCreator;
  "llm/tools/profilePictureGenerator": typeof llm_tools_profilePictureGenerator;
  "llm/tools/videoPrompter": typeof llm_tools_videoPrompter;
  "llm/triggers/generateDepthMap": typeof llm_triggers_generateDepthMap;
  "llm/triggers/generateFace": typeof llm_triggers_generateFace;
  "llm/triggers/generateVideo": typeof llm_triggers_generateVideo;
  "llm/triggers/itemCategorizer": typeof llm_triggers_itemCategorizer;
  "llm/triggers/photoshoot": typeof llm_triggers_photoshoot;
  "llm/triggers/presetCreator": typeof llm_triggers_presetCreator;
  "llm/triggers/presetPreview": typeof llm_triggers_presetPreview;
  "llm/triggers/removeBackground": typeof llm_triggers_removeBackground;
  "llm/utils/createTool": typeof llm_utils_createTool;
  "llm/utils/index": typeof llm_utils_index;
  "llm/utils/photoshoot/index": typeof llm_utils_photoshoot_index;
  "llm/utils/photoshoot/jsonCreator": typeof llm_utils_photoshoot_jsonCreator;
  "llm/utils/photoshoot/toMarkdown": typeof llm_utils_photoshoot_toMarkdown;
  "llm/utils/sanitizeAiText": typeof llm_utils_sanitizeAiText;
  "llm/utils/usageHandler": typeof llm_utils_usageHandler;
  "llm/utils/wrapAgent": typeof llm_utils_wrapAgent;
  migrations: typeof migrations;
  procedures: typeof procedures;
  "router/admin/bots/createIdentity": typeof router_admin_bots_createIdentity;
  "router/admin/bots/createOne": typeof router_admin_bots_createOne;
  "router/admin/bots/createTestAccount": typeof router_admin_bots_createTestAccount;
  "router/admin/bots/crons": typeof router_admin_bots_crons;
  "router/admin/bots/getAll": typeof router_admin_bots_getAll;
  "router/admin/bots/getWaiting": typeof router_admin_bots_getWaiting;
  "router/admin/config/getConfig": typeof router_admin_config_getConfig;
  "router/admin/config/initConfig": typeof router_admin_config_initConfig;
  "router/admin/outfits/regenerateCovers": typeof router_admin_outfits_regenerateCovers;
  "router/admin/presets/findByName": typeof router_admin_presets_findByName;
  "router/admin/presets/repairOne": typeof router_admin_presets_repairOne;
  "router/admin/users/approveWaitlist": typeof router_admin_users_approveWaitlist;
  "router/auth/getTestAccount": typeof router_auth_getTestAccount;
  "router/auth/linkStripeSubscription": typeof router_auth_linkStripeSubscription;
  "router/auth/postCreateOrUpdate": typeof router_auth_postCreateOrUpdate;
  "router/collection/getBookmarked": typeof router_collection_getBookmarked;
  "router/collection/getBookmarks": typeof router_collection_getBookmarks;
  "router/collection/toggleBookmark": typeof router_collection_toggleBookmark;
  "router/credits/canPay": typeof router_credits_canPay;
  "router/credits/claimDaily": typeof router_credits_claimDaily;
  "router/credits/deductCredits": typeof router_credits_deductCredits;
  "router/credits/getCost": typeof router_credits_getCost;
  "router/credits/getTransactionsPaginated": typeof router_credits_getTransactionsPaginated;
  "router/credits/getUserWallet": typeof router_credits_getUserWallet;
  "router/credits/grantCredits": typeof router_credits_grantCredits;
  "router/credits/refundCredits": typeof router_credits_refundCredits;
  "router/feed/getFromOutfit": typeof router_feed_getFromOutfit;
  "router/feed/getFromPreset": typeof router_feed_getFromPreset;
  "router/feed/getPaginated": typeof router_feed_getPaginated;
  "router/generations/autoRefund": typeof router_generations_autoRefund;
  "router/generations/createOne": typeof router_generations_createOne;
  "router/generations/getAll": typeof router_generations_getAll;
  "router/generations/getFromPrediction": typeof router_generations_getFromPrediction;
  "router/generations/getOne": typeof router_generations_getOne;
  "router/generations/getPaginated": typeof router_generations_getPaginated;
  "router/generations/getUser": typeof router_generations_getUser;
  "router/generations/newPredictions": typeof router_generations_newPredictions;
  "router/generations/publishRest": typeof router_generations_publishRest;
  "router/generations/updatePrediction": typeof router_generations_updatePrediction;
  "router/items/createOne": typeof router_items_createOne;
  "router/items/deleteOne": typeof router_items_deleteOne;
  "router/items/editOne": typeof router_items_editOne;
  "router/items/getAll": typeof router_items_getAll;
  "router/items/getFromUser": typeof router_items_getFromUser;
  "router/items/getMany": typeof router_items_getMany;
  "router/items/getOne": typeof router_items_getOne;
  "router/items/getPaginated": typeof router_items_getPaginated;
  "router/items/replaceImage": typeof router_items_replaceImage;
  "router/items/searchMany": typeof router_items_searchMany;
  "router/likes/getLiked": typeof router_likes_getLiked;
  "router/likes/getLikes": typeof router_likes_getLikes;
  "router/likes/toggleLike": typeof router_likes_toggleLike;
  "router/notifications/getPaginated": typeof router_notifications_getPaginated;
  "router/notifications/getUnread": typeof router_notifications_getUnread;
  "router/notifications/readNotifications": typeof router_notifications_readNotifications;
  "router/notifications/registerPushToken": typeof router_notifications_registerPushToken;
  "router/notifications/sendPushNotification": typeof router_notifications_sendPushNotification;
  "router/notifications/sendPushNotificationSteps": typeof router_notifications_sendPushNotificationSteps;
  "router/outfits/createOne": typeof router_outfits_createOne;
  "router/outfits/deleteOne": typeof router_outfits_deleteOne;
  "router/outfits/editOne": typeof router_outfits_editOne;
  "router/outfits/getAll": typeof router_outfits_getAll;
  "router/outfits/getFromUser": typeof router_outfits_getFromUser;
  "router/outfits/getLatest": typeof router_outfits_getLatest;
  "router/outfits/getOne": typeof router_outfits_getOne;
  "router/outfits/searchMany": typeof router_outfits_searchMany;
  "router/outfits/updateCover": typeof router_outfits_updateCover;
  "router/outfits/updateCoverInternal": typeof router_outfits_updateCoverInternal;
  "router/outfits/wearCount": typeof router_outfits_wearCount;
  "router/presets/createOne": typeof router_presets_createOne;
  "router/presets/deleteOne": typeof router_presets_deleteOne;
  "router/presets/getByCategory": typeof router_presets_getByCategory;
  "router/presets/getByUser": typeof router_presets_getByUser;
  "router/presets/getCategories": typeof router_presets_getCategories;
  "router/presets/getMany": typeof router_presets_getMany;
  "router/presets/getOne": typeof router_presets_getOne;
  "router/presets/recreateCount": typeof router_presets_recreateCount;
  "router/presets/searchMany": typeof router_presets_searchMany;
  "router/presets/updateOne": typeof router_presets_updateOne;
  "router/quests/getAll": typeof router_quests_getAll;
  "router/quests/getOne": typeof router_quests_getOne;
  "router/quests/initAll": typeof router_quests_initAll;
  "router/quests/updateOne": typeof router_quests_updateOne;
  "router/storage/images/deleteOne": typeof router_storage_images_deleteOne;
  "router/storage/images/deleteOneMutationInternal": typeof router_storage_images_deleteOneMutationInternal;
  "router/storage/images/getLatest": typeof router_storage_images_getLatest;
  "router/storage/images/getMany": typeof router_storage_images_getMany;
  "router/storage/images/getOne": typeof router_storage_images_getOne;
  "router/storage/images/saveMany": typeof router_storage_images_saveMany;
  "router/storage/images/saveSizes": typeof router_storage_images_saveSizes;
  "router/storage/images/uploadMany": typeof router_storage_images_uploadMany;
  "router/storage/images/uploadOne": typeof router_storage_images_uploadOne;
  "router/storage/images/uploadSizes": typeof router_storage_images_uploadSizes;
  "router/storage/videos/deleteOne": typeof router_storage_videos_deleteOne;
  "router/storage/videos/deleteOneMutationInternal": typeof router_storage_videos_deleteOneMutationInternal;
  "router/storage/videos/getMany": typeof router_storage_videos_getMany;
  "router/storage/videos/getOne": typeof router_storage_videos_getOne;
  "router/storage/videos/saveOne": typeof router_storage_videos_saveOne;
  "router/storage/videos/uploadOne": typeof router_storage_videos_uploadOne;
  "router/stripe/billingPortal": typeof router_stripe_billingPortal;
  "router/stripe/cancelDbSubscription": typeof router_stripe_cancelDbSubscription;
  "router/stripe/createCheckoutUrl": typeof router_stripe_createCheckoutUrl;
  "router/stripe/createDbSubscription": typeof router_stripe_createDbSubscription;
  "router/stripe/createServerSubscription": typeof router_stripe_createServerSubscription;
  "router/subscriptions/cancelSubscription": typeof router_subscriptions_cancelSubscription;
  "router/subscriptions/createFreeSubscription": typeof router_subscriptions_createFreeSubscription;
  "router/subscriptions/createSubscription": typeof router_subscriptions_createSubscription;
  "router/subscriptions/endOne": typeof router_subscriptions_endOne;
  "router/subscriptions/getUserSubscription": typeof router_subscriptions_getUserSubscription;
  "router/subscriptions/updateSubscriptionStatus": typeof router_subscriptions_updateSubscriptionStatus;
  "router/users/checkUsername": typeof router_users_checkUsername;
  "router/users/deleteAccount": typeof router_users_deleteAccount;
  "router/users/follows/checkFollowing": typeof router_users_follows_checkFollowing;
  "router/users/follows/getFollowStats": typeof router_users_follows_getFollowStats;
  "router/users/follows/getFollowersPaginated": typeof router_users_follows_getFollowersPaginated;
  "router/users/follows/getFollowingPaginated": typeof router_users_follows_getFollowingPaginated;
  "router/users/follows/getRelatedPaginated": typeof router_users_follows_getRelatedPaginated;
  "router/users/follows/toggleFollow": typeof router_users_follows_toggleFollow;
  "router/users/getAccount": typeof router_users_getAccount;
  "router/users/getAppearance": typeof router_users_getAppearance;
  "router/users/getFromStripeId": typeof router_users_getFromStripeId;
  "router/users/searchMany": typeof router_users_searchMany;
  "router/users/upsertAppearance": typeof router_users_upsertAppearance;
  "router/users/upsertImage": typeof router_users_upsertImage;
  "router/users/upsertUsername": typeof router_users_upsertUsername;
  "router/waitlist/enterCode": typeof router_waitlist_enterCode;
  "router/waitlist/generateCodes": typeof router_waitlist_generateCodes;
  "router/waitlist/getCodes": typeof router_waitlist_getCodes;
  "router/waitlist/getStatistics": typeof router_waitlist_getStatistics;
  "schema/auth": typeof schema_auth;
  "schema/collection": typeof schema_collection;
  "schema/config": typeof schema_config;
  "schema/constants": typeof schema_constants;
  "schema/feed": typeof schema_feed;
  "schema/follows": typeof schema_follows;
  "schema/generations": typeof schema_generations;
  "schema/images": typeof schema_images;
  "schema/items": typeof schema_items;
  "schema/likes": typeof schema_likes;
  "schema/notifications": typeof schema_notifications;
  "schema/outfits": typeof schema_outfits;
  "schema/presets": typeof schema_presets;
  "schema/quests": typeof schema_quests;
  "schema/subscriptions": typeof schema_subscriptions;
  "schema/users": typeof schema_users;
  "schema/videos": typeof schema_videos;
  "schema/waitlist": typeof schema_waitlist;
  "schema/wallets": typeof schema_wallets;
  "utils/isAuthorized": typeof utils_isAuthorized;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
          oneBatchOnly?: boolean;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
  actionCache: {
    crons: {
      purge: FunctionReference<
        "mutation",
        "internal",
        { expiresAt?: number },
        null
      >;
    };
    lib: {
      get: FunctionReference<
        "query",
        "internal",
        { args: any; name: string; ttl: number | null },
        { kind: "hit"; value: any } | { expiredEntry?: string; kind: "miss" }
      >;
      put: FunctionReference<
        "mutation",
        "internal",
        {
          args: any;
          expiredEntry?: string;
          name: string;
          ttl: number | null;
          value: any;
        },
        { cacheHit: boolean; deletedExpiredEntry: boolean }
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; before?: number; name?: string },
        null
      >;
    };
  };
  agent: {
    apiKeys: {
      destroy: FunctionReference<
        "mutation",
        "internal",
        { apiKey?: string; name?: string },
        | "missing"
        | "deleted"
        | "name mismatch"
        | "must provide either apiKey or name"
      >;
      issue: FunctionReference<
        "mutation",
        "internal",
        { name?: string },
        string
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { apiKey: string },
        boolean
      >;
    };
    files: {
      addFile: FunctionReference<
        "mutation",
        "internal",
        {
          filename?: string;
          hash: string;
          mimeType: string;
          storageId: string;
        },
        { fileId: string; storageId: string }
      >;
      copyFile: FunctionReference<
        "mutation",
        "internal",
        { fileId: string },
        null
      >;
      deleteFiles: FunctionReference<
        "mutation",
        "internal",
        { fileIds: Array<string>; force?: boolean },
        Array<string>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { fileId: string },
        null | {
          _creationTime: number;
          _id: string;
          filename?: string;
          hash: string;
          lastTouchedAt: number;
          mimeType: string;
          refcount: number;
          storageId: string;
        }
      >;
      getFilesToDelete: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            filename?: string;
            hash: string;
            lastTouchedAt: number;
            mimeType: string;
            refcount: number;
            storageId: string;
          }>;
        }
      >;
      useExistingFile: FunctionReference<
        "mutation",
        "internal",
        { filename?: string; hash: string },
        null | { fileId: string; storageId: string }
      >;
    };
    messages: {
      addMessages: FunctionReference<
        "mutation",
        "internal",
        {
          agentName?: string;
          embeddings?: {
            dimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
            model: string;
            vectors: Array<Array<number> | null>;
          };
          failPendingSteps?: boolean;
          hideFromUserIdSearch?: boolean;
          messages: Array<{
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            message:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status?: "pending" | "success" | "failed";
            text?: string;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pendingMessageId?: string;
          promptMessageId?: string;
          threadId: string;
          userId?: string;
        },
        {
          messages: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?: string;
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            order: number;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            providerOptions?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status: "pending" | "success" | "failed";
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
        }
      >;
      cloneThread: FunctionReference<
        "action",
        "internal",
        {
          batchSize?: number;
          copyUserIdForVectorSearch?: boolean;
          excludeToolMessages?: boolean;
          insertAtOrder?: number;
          limit?: number;
          sourceThreadId: string;
          statuses?: Array<"pending" | "success" | "failed">;
          targetThreadId: string;
          upToAndIncludingMessageId?: string;
        },
        number
      >;
      deleteByIds: FunctionReference<
        "mutation",
        "internal",
        { messageIds: Array<string> },
        Array<string>
      >;
      deleteByOrder: FunctionReference<
        "mutation",
        "internal",
        {
          endOrder: number;
          endStepOrder?: number;
          startOrder: number;
          startStepOrder?: number;
          threadId: string;
        },
        { isDone: boolean; lastOrder?: number; lastStepOrder?: number }
      >;
      finalizeMessage: FunctionReference<
        "mutation",
        "internal",
        {
          messageId: string;
          result: { status: "success" } | { error: string; status: "failed" };
        },
        null
      >;
      getMessagesByIds: FunctionReference<
        "query",
        "internal",
        { messageIds: Array<string> },
        Array<null | {
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      getMessageSearchFields: FunctionReference<
        "query",
        "internal",
        { messageId: string },
        { embedding?: Array<number>; embeddingModel?: string; text?: string }
      >;
      listMessagesByThreadId: FunctionReference<
        "query",
        "internal",
        {
          excludeToolMessages?: boolean;
          order: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          statuses?: Array<"pending" | "success" | "failed">;
          threadId: string;
          upToAndIncludingMessageId?: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            agentName?: string;
            embeddingId?: string;
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            id?: string;
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            order: number;
            provider?: string;
            providerMetadata?: Record<string, Record<string, any>>;
            providerOptions?: Record<string, Record<string, any>>;
            reasoning?: string;
            reasoningDetails?: Array<
              | {
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  signature?: string;
                  text: string;
                  type: "reasoning";
                }
              | { signature?: string; text: string; type: "text" }
              | { data: string; type: "redacted" }
            >;
            sources?: Array<
              | {
                  id: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "url";
                  title?: string;
                  type?: "source";
                  url: string;
                }
              | {
                  filename?: string;
                  id: string;
                  mediaType: string;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  sourceType: "document";
                  title: string;
                  type: "source";
                }
            >;
            status: "pending" | "success" | "failed";
            stepOrder: number;
            text?: string;
            threadId: string;
            tool: boolean;
            usage?: {
              cachedInputTokens?: number;
              completionTokens: number;
              promptTokens: number;
              reasoningTokens?: number;
              totalTokens: number;
            };
            userId?: string;
            warnings?: Array<
              | {
                  details?: string;
                  setting: string;
                  type: "unsupported-setting";
                }
              | { details?: string; tool: any; type: "unsupported-tool" }
              | { message: string; type: "other" }
            >;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      searchMessages: FunctionReference<
        "action",
        "internal",
        {
          embedding?: Array<number>;
          embeddingModel?: string;
          limit: number;
          messageRange?: { after: number; before: number };
          searchAllMessagesForUserId?: string;
          targetMessageId?: string;
          text?: string;
          textSearch?: boolean;
          threadId?: string;
          vectorScoreThreshold?: number;
          vectorSearch?: boolean;
        },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      textSearch: FunctionReference<
        "query",
        "internal",
        {
          limit: number;
          searchAllMessagesForUserId?: string;
          targetMessageId?: string;
          text?: string;
          threadId?: string;
        },
        Array<{
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }>
      >;
      updateMessage: FunctionReference<
        "mutation",
        "internal",
        {
          messageId: string;
          patch: {
            error?: string;
            fileIds?: Array<string>;
            finishReason?:
              | "stop"
              | "length"
              | "content-filter"
              | "tool-calls"
              | "error"
              | "other"
              | "unknown";
            message?:
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            image: string | ArrayBuffer;
                            mimeType?: string;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "image";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "user";
                }
              | {
                  content:
                    | string
                    | Array<
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            text: string;
                            type: "text";
                          }
                        | {
                            data: string | ArrayBuffer;
                            filename?: string;
                            mimeType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "file";
                          }
                        | {
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            signature?: string;
                            text: string;
                            type: "reasoning";
                          }
                        | {
                            data: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            type: "redacted-reasoning";
                          }
                        | {
                            args: any;
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-call";
                          }
                        | {
                            args?: any;
                            experimental_content?: Array<
                              | { text: string; type: "text" }
                              | {
                                  data: string;
                                  mimeType?: string;
                                  type: "image";
                                }
                            >;
                            isError?: boolean;
                            output?:
                              | { type: "text"; value: string }
                              | { type: "json"; value: any }
                              | { type: "error-text"; value: string }
                              | { type: "error-json"; value: any }
                              | {
                                  type: "content";
                                  value: Array<
                                    | { text: string; type: "text" }
                                    | {
                                        data: string;
                                        mediaType: string;
                                        type: "media";
                                      }
                                  >;
                                };
                            providerExecuted?: boolean;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            result?: any;
                            toolCallId: string;
                            toolName: string;
                            type: "tool-result";
                          }
                        | {
                            id: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "url";
                            title?: string;
                            type: "source";
                            url: string;
                          }
                        | {
                            filename?: string;
                            id: string;
                            mediaType: string;
                            providerMetadata?: Record<
                              string,
                              Record<string, any>
                            >;
                            providerOptions?: Record<
                              string,
                              Record<string, any>
                            >;
                            sourceType: "document";
                            title: string;
                            type: "source";
                          }
                      >;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "assistant";
                }
              | {
                  content: Array<{
                    args?: any;
                    experimental_content?: Array<
                      | { text: string; type: "text" }
                      | { data: string; mimeType?: string; type: "image" }
                    >;
                    isError?: boolean;
                    output?:
                      | { type: "text"; value: string }
                      | { type: "json"; value: any }
                      | { type: "error-text"; value: string }
                      | { type: "error-json"; value: any }
                      | {
                          type: "content";
                          value: Array<
                            | { text: string; type: "text" }
                            | { data: string; mediaType: string; type: "media" }
                          >;
                        };
                    providerExecuted?: boolean;
                    providerMetadata?: Record<string, Record<string, any>>;
                    providerOptions?: Record<string, Record<string, any>>;
                    result?: any;
                    toolCallId: string;
                    toolName: string;
                    type: "tool-result";
                  }>;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "tool";
                }
              | {
                  content: string;
                  providerOptions?: Record<string, Record<string, any>>;
                  role: "system";
                };
            model?: string;
            provider?: string;
            providerOptions?: Record<string, Record<string, any>>;
            status?: "pending" | "success" | "failed";
          };
        },
        {
          _creationTime: number;
          _id: string;
          agentName?: string;
          embeddingId?: string;
          error?: string;
          fileIds?: Array<string>;
          finishReason?:
            | "stop"
            | "length"
            | "content-filter"
            | "tool-calls"
            | "error"
            | "other"
            | "unknown";
          id?: string;
          message?:
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          image: string | ArrayBuffer;
                          mimeType?: string;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "image";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "user";
              }
            | {
                content:
                  | string
                  | Array<
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          text: string;
                          type: "text";
                        }
                      | {
                          data: string | ArrayBuffer;
                          filename?: string;
                          mimeType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "file";
                        }
                      | {
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          signature?: string;
                          text: string;
                          type: "reasoning";
                        }
                      | {
                          data: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          type: "redacted-reasoning";
                        }
                      | {
                          args: any;
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-call";
                        }
                      | {
                          args?: any;
                          experimental_content?: Array<
                            | { text: string; type: "text" }
                            | { data: string; mimeType?: string; type: "image" }
                          >;
                          isError?: boolean;
                          output?:
                            | { type: "text"; value: string }
                            | { type: "json"; value: any }
                            | { type: "error-text"; value: string }
                            | { type: "error-json"; value: any }
                            | {
                                type: "content";
                                value: Array<
                                  | { text: string; type: "text" }
                                  | {
                                      data: string;
                                      mediaType: string;
                                      type: "media";
                                    }
                                >;
                              };
                          providerExecuted?: boolean;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          result?: any;
                          toolCallId: string;
                          toolName: string;
                          type: "tool-result";
                        }
                      | {
                          id: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "url";
                          title?: string;
                          type: "source";
                          url: string;
                        }
                      | {
                          filename?: string;
                          id: string;
                          mediaType: string;
                          providerMetadata?: Record<
                            string,
                            Record<string, any>
                          >;
                          providerOptions?: Record<string, Record<string, any>>;
                          sourceType: "document";
                          title: string;
                          type: "source";
                        }
                    >;
                providerOptions?: Record<string, Record<string, any>>;
                role: "assistant";
              }
            | {
                content: Array<{
                  args?: any;
                  experimental_content?: Array<
                    | { text: string; type: "text" }
                    | { data: string; mimeType?: string; type: "image" }
                  >;
                  isError?: boolean;
                  output?:
                    | { type: "text"; value: string }
                    | { type: "json"; value: any }
                    | { type: "error-text"; value: string }
                    | { type: "error-json"; value: any }
                    | {
                        type: "content";
                        value: Array<
                          | { text: string; type: "text" }
                          | { data: string; mediaType: string; type: "media" }
                        >;
                      };
                  providerExecuted?: boolean;
                  providerMetadata?: Record<string, Record<string, any>>;
                  providerOptions?: Record<string, Record<string, any>>;
                  result?: any;
                  toolCallId: string;
                  toolName: string;
                  type: "tool-result";
                }>;
                providerOptions?: Record<string, Record<string, any>>;
                role: "tool";
              }
            | {
                content: string;
                providerOptions?: Record<string, Record<string, any>>;
                role: "system";
              };
          model?: string;
          order: number;
          provider?: string;
          providerMetadata?: Record<string, Record<string, any>>;
          providerOptions?: Record<string, Record<string, any>>;
          reasoning?: string;
          reasoningDetails?: Array<
            | {
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                signature?: string;
                text: string;
                type: "reasoning";
              }
            | { signature?: string; text: string; type: "text" }
            | { data: string; type: "redacted" }
          >;
          sources?: Array<
            | {
                id: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "url";
                title?: string;
                type?: "source";
                url: string;
              }
            | {
                filename?: string;
                id: string;
                mediaType: string;
                providerMetadata?: Record<string, Record<string, any>>;
                providerOptions?: Record<string, Record<string, any>>;
                sourceType: "document";
                title: string;
                type: "source";
              }
          >;
          status: "pending" | "success" | "failed";
          stepOrder: number;
          text?: string;
          threadId: string;
          tool: boolean;
          usage?: {
            cachedInputTokens?: number;
            completionTokens: number;
            promptTokens: number;
            reasoningTokens?: number;
            totalTokens: number;
          };
          userId?: string;
          warnings?: Array<
            | { details?: string; setting: string; type: "unsupported-setting" }
            | { details?: string; tool: any; type: "unsupported-tool" }
            | { message: string; type: "other" }
          >;
        }
      >;
    };
    streams: {
      abort: FunctionReference<
        "mutation",
        "internal",
        {
          finalDelta?: {
            end: number;
            parts: Array<any>;
            start: number;
            streamId: string;
          };
          reason: string;
          streamId: string;
        },
        boolean
      >;
      abortByOrder: FunctionReference<
        "mutation",
        "internal",
        { order: number; reason: string; threadId: string },
        boolean
      >;
      addDelta: FunctionReference<
        "mutation",
        "internal",
        { end: number; parts: Array<any>; start: number; streamId: string },
        boolean
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          agentName?: string;
          format?: "UIMessageChunk" | "TextStreamPart";
          model?: string;
          order: number;
          provider?: string;
          providerOptions?: Record<string, Record<string, any>>;
          stepOrder: number;
          threadId: string;
          userId?: string;
        },
        string
      >;
      deleteAllStreamsForThreadIdAsync: FunctionReference<
        "mutation",
        "internal",
        { deltaCursor?: string; streamOrder?: number; threadId: string },
        { deltaCursor?: string; isDone: boolean; streamOrder?: number }
      >;
      deleteAllStreamsForThreadIdSync: FunctionReference<
        "action",
        "internal",
        { threadId: string },
        null
      >;
      deleteStreamAsync: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; streamId: string },
        null
      >;
      deleteStreamSync: FunctionReference<
        "mutation",
        "internal",
        { streamId: string },
        null
      >;
      finish: FunctionReference<
        "mutation",
        "internal",
        {
          finalDelta?: {
            end: number;
            parts: Array<any>;
            start: number;
            streamId: string;
          };
          streamId: string;
        },
        null
      >;
      heartbeat: FunctionReference<
        "mutation",
        "internal",
        { streamId: string },
        null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          startOrder?: number;
          statuses?: Array<"streaming" | "finished" | "aborted">;
          threadId: string;
        },
        Array<{
          agentName?: string;
          format?: "UIMessageChunk" | "TextStreamPart";
          model?: string;
          order: number;
          provider?: string;
          providerOptions?: Record<string, Record<string, any>>;
          status: "streaming" | "finished" | "aborted";
          stepOrder: number;
          streamId: string;
          userId?: string;
        }>
      >;
      listDeltas: FunctionReference<
        "query",
        "internal",
        {
          cursors: Array<{ cursor: number; streamId: string }>;
          threadId: string;
        },
        Array<{
          end: number;
          parts: Array<any>;
          start: number;
          streamId: string;
        }>
      >;
    };
    threads: {
      createThread: FunctionReference<
        "mutation",
        "internal",
        {
          defaultSystemPrompt?: string;
          parentThreadIds?: Array<string>;
          summary?: string;
          title?: string;
          userId?: string;
        },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
      deleteAllForThreadIdAsync: FunctionReference<
        "mutation",
        "internal",
        {
          cursor?: string;
          deltaCursor?: string;
          limit?: number;
          messagesDone?: boolean;
          streamOrder?: number;
          streamsDone?: boolean;
          threadId: string;
        },
        { isDone: boolean }
      >;
      deleteAllForThreadIdSync: FunctionReference<
        "action",
        "internal",
        { limit?: number; threadId: string },
        null
      >;
      getThread: FunctionReference<
        "query",
        "internal",
        { threadId: string },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        } | null
      >;
      listThreadsByUserId: FunctionReference<
        "query",
        "internal",
        {
          order?: "asc" | "desc";
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          userId?: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            status: "active" | "archived";
            summary?: string;
            title?: string;
            userId?: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      searchThreadTitles: FunctionReference<
        "query",
        "internal",
        { limit: number; query: string; userId?: string | null },
        Array<{
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }>
      >;
      updateThread: FunctionReference<
        "mutation",
        "internal",
        {
          patch: {
            status?: "active" | "archived";
            summary?: string;
            title?: string;
            userId?: string;
          };
          threadId: string;
        },
        {
          _creationTime: number;
          _id: string;
          status: "active" | "archived";
          summary?: string;
          title?: string;
          userId?: string;
        }
      >;
    };
    users: {
      deleteAllForUserId: FunctionReference<
        "action",
        "internal",
        { userId: string },
        null
      >;
      deleteAllForUserIdAsync: FunctionReference<
        "mutation",
        "internal",
        { userId: string },
        boolean
      >;
      listUsersWithThreads: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<string>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
    };
    vector: {
      index: {
        deleteBatch: FunctionReference<
          "mutation",
          "internal",
          {
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
          },
          null
        >;
        deleteBatchForThread: FunctionReference<
          "mutation",
          "internal",
          {
            cursor?: string;
            limit: number;
            model: string;
            threadId: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          { continueCursor: string; isDone: boolean }
        >;
        insertBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
            vectors: Array<{
              messageId?: string;
              model: string;
              table: string;
              threadId?: string;
              userId?: string;
              vector: Array<number>;
            }>;
          },
          Array<
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
            | string
          >
        >;
        paginate: FunctionReference<
          "query",
          "internal",
          {
            cursor?: string;
            limit: number;
            table?: string;
            targetModel: string;
            vectorDimension:
              | 128
              | 256
              | 512
              | 768
              | 1024
              | 1408
              | 1536
              | 2048
              | 3072
              | 4096;
          },
          {
            continueCursor: string;
            ids: Array<
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
              | string
            >;
            isDone: boolean;
          }
        >;
        updateBatch: FunctionReference<
          "mutation",
          "internal",
          {
            vectors: Array<{
              id:
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string
                | string;
              model: string;
              vector: Array<number>;
            }>;
          },
          null
        >;
      };
    };
  };
  rag: {
    chunks: {
      insert: FunctionReference<
        "mutation",
        "internal",
        {
          chunks: Array<{
            content: { metadata?: Record<string, any>; text: string };
            embedding: Array<number>;
            searchableText?: string;
          }>;
          entryId: string;
          startOrder: number;
        },
        { status: "pending" | "ready" | "replaced" }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          entryId: string;
          order: "desc" | "asc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            metadata?: Record<string, any>;
            order: number;
            state: "pending" | "ready" | "replaced";
            text: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      replaceChunksPage: FunctionReference<
        "mutation",
        "internal",
        { entryId: string; startOrder: number },
        { nextStartOrder: number; status: "pending" | "ready" | "replaced" }
      >;
    };
    entries: {
      add: FunctionReference<
        "mutation",
        "internal",
        {
          allChunks?: Array<{
            content: { metadata?: Record<string, any>; text: string };
            embedding: Array<number>;
            searchableText?: string;
          }>;
          entry: {
            contentHash?: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            namespaceId: string;
            title?: string;
          };
          onComplete?: string;
        },
        {
          created: boolean;
          entryId: string;
          status: "pending" | "ready" | "replaced";
        }
      >;
      addAsync: FunctionReference<
        "mutation",
        "internal",
        {
          chunker: string;
          entry: {
            contentHash?: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            namespaceId: string;
            title?: string;
          };
          onComplete?: string;
        },
        { created: boolean; entryId: string; status: "pending" | "ready" }
      >;
      deleteAsync: FunctionReference<
        "mutation",
        "internal",
        { entryId: string; startOrder: number },
        null
      >;
      deleteByKeyAsync: FunctionReference<
        "mutation",
        "internal",
        { beforeVersion?: number; key: string; namespaceId: string },
        null
      >;
      deleteByKeySync: FunctionReference<
        "action",
        "internal",
        { key: string; namespaceId: string },
        null
      >;
      deleteSync: FunctionReference<
        "action",
        "internal",
        { entryId: string },
        null
      >;
      findByContentHash: FunctionReference<
        "query",
        "internal",
        {
          contentHash: string;
          dimension: number;
          filterNames: Array<string>;
          key: string;
          modelId: string;
          namespace: string;
        },
        {
          contentHash?: string;
          entryId: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          key?: string;
          metadata?: Record<string, any>;
          replacedAt?: number;
          status: "pending" | "ready" | "replaced";
          title?: string;
        } | null
      >;
      get: FunctionReference<
        "query",
        "internal",
        { entryId: string },
        {
          contentHash?: string;
          entryId: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          key?: string;
          metadata?: Record<string, any>;
          replacedAt?: number;
          status: "pending" | "ready" | "replaced";
          title?: string;
        } | null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          namespaceId?: string;
          order?: "desc" | "asc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status: "pending" | "ready" | "replaced";
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      promoteToReady: FunctionReference<
        "mutation",
        "internal",
        { entryId: string },
        {
          replacedEntry: {
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          } | null;
        }
      >;
    };
    namespaces: {
      deleteNamespace: FunctionReference<
        "mutation",
        "internal",
        { namespaceId: string },
        {
          deletedNamespace: null | {
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          };
        }
      >;
      deleteNamespaceSync: FunctionReference<
        "action",
        "internal",
        { namespaceId: string },
        null
      >;
      get: FunctionReference<
        "query",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
        },
        null | {
          createdAt: number;
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
          namespaceId: string;
          status: "pending" | "ready" | "replaced";
          version: number;
        }
      >;
      getOrCreate: FunctionReference<
        "mutation",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
          onComplete?: string;
          status: "pending" | "ready";
        },
        { namespaceId: string; status: "pending" | "ready" }
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          status: "pending" | "ready" | "replaced";
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      listNamespaceVersions: FunctionReference<
        "query",
        "internal",
        {
          namespace: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      lookup: FunctionReference<
        "query",
        "internal",
        {
          dimension: number;
          filterNames: Array<string>;
          modelId: string;
          namespace: string;
        },
        null | string
      >;
      promoteToReady: FunctionReference<
        "mutation",
        "internal",
        { namespaceId: string },
        {
          replacedNamespace: null | {
            createdAt: number;
            dimension: number;
            filterNames: Array<string>;
            modelId: string;
            namespace: string;
            namespaceId: string;
            status: "pending" | "ready" | "replaced";
            version: number;
          };
        }
      >;
    };
    search: {
      search: FunctionReference<
        "action",
        "internal",
        {
          chunkContext?: { after: number; before: number };
          embedding: Array<number>;
          filters: Array<{ name: string; value: any }>;
          limit: number;
          modelId: string;
          namespace: string;
          vectorScoreThreshold?: number;
        },
        {
          entries: Array<{
            contentHash?: string;
            entryId: string;
            filterValues: Array<{ name: string; value: any }>;
            importance: number;
            key?: string;
            metadata?: Record<string, any>;
            replacedAt?: number;
            status: "pending" | "ready" | "replaced";
            title?: string;
          }>;
          results: Array<{
            content: Array<{ metadata?: Record<string, any>; text: string }>;
            entryId: string;
            order: number;
            score: number;
            startOrder: number;
          }>;
        }
      >;
    };
  };
};
