import { api, Doc, Id } from "@/lib/convex/client";
import { useMutation, useQuery } from "convex/react";

type ContentRating = Doc<'items'>['contentRating'];

export const useSafety = () => {
  const getBlockedContents = useQuery(api.router.safety.getBlockedContents.authed, {});

  const blockUserMutation = useMutation(api.router.safety.blockUser.authed);
  const unblockUserMutation = useMutation(api.router.safety.unblockUser.authed);
  const reportContentMutation = useMutation(api.router.safety.reportContent.authed);

  type ContentRatingParams = {
    contentRating?: ContentRating,
    item?: { contentRating: ContentRating },
    outfit?: { contentRating: ContentRating },
    preset?: { contentRating: ContentRating },
  }
  const isNsfw = (params: ContentRatingParams) => {
    const contentRating = params.contentRating ?? params.item?.contentRating
      ?? params.outfit?.contentRating
      ?? params.preset?.contentRating;
    return contentRating === 'NSFW';
  }

  type IsHiddenParams = {
    userId?: Id<'users'>,
    outfitId?: Id<'outfits'>,
    generationId?: Id<'generations'>,
    presetId?: Id<'presets'>,
    itemId?: Id<'items'>,
    itemIds?: Id<'items'>[],
  } & ContentRatingParams;
  const isHidden = (params: IsHiddenParams) => {
    if (isNsfw(params)) return true;

    if (!getBlockedContents) return false; // Default to not hidden until loaded

    if (params.userId && getBlockedContents.blockedUsers.includes(params.userId)) return true;
    if (params.outfitId && getBlockedContents.reportedOutfits.includes(params.outfitId)) return true;
    if (params.generationId && getBlockedContents.reportedGenerations.includes(params.generationId)) return true;
    if (params.presetId && getBlockedContents.reportedPresets.includes(params.presetId)) return true;
    if (params.itemId && getBlockedContents.reportedItems.includes(params.itemId)) return true;
    if (params.itemIds && params.itemIds.some(itemId => getBlockedContents.reportedItems.includes(itemId))) return true;

    return false;
  };

  const blockUser = async (userIdToBlock: Id<'users'>) => {
    return blockUserMutation({ userId: userIdToBlock });
  };

  const unblockUser = async (userIdToUnblock: Id<'users'>) => {
    return unblockUserMutation({ userId: userIdToUnblock });
  };

  const reportContent = async (params: {
    outfitId?: Id<'outfits'>;
    generationId?: Id<'generations'>;
    presetId?: Id<'presets'>;
    itemId?: Id<'items'>;
    reason: string;
  }) => {
    return reportContentMutation({
      outfitId: params.outfitId,
      generationId: params.generationId,
      presetId: params.presetId,
      itemId: params.itemId,
      reason: params.reason,
    });
  };

  const blockedContents = getBlockedContents || {
    blockedUsers: [],
    reportedUsers: [],
    reportedOutfits: [],
    reportedGenerations: [],
    reportedItems: [],
    reportedPresets: [],
  }

  return {
    blockedContents,
    isNsfw,
    isHidden,
    blockUser,
    unblockUser,
    reportContent,
  };
};