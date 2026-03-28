import { CREDITS_CONFIG } from "../../functions/credits";
import { internalMutation } from "../../procedures";
import type { QuestCategory, QuestType } from "../../schema/quests";

const getCreditsAmount = (percent: number) => {
  return Math.round(CREDITS_CONFIG.COST_PER_IMAGE_GENERATION * (percent / 100));
};

type Quest = {
  title: string;
  description: string;
  category: QuestCategory;
  type: QuestType;
  target: number;
  rewardPercent: number;
}

const quests: Quest[] = [
  // 1. Welcome to the club (Onboarding) - 7 quests
  {
    title: "Look at my pic!",
    description: "Publish your first post",
    category: "onboarding",
    type: "posts_published",
    target: 1,
    rewardPercent: 25,
  },
  {
    title: "Mom, I'm famous!",
    description: "Receive your first like",
    category: "onboarding",
    type: "likes_received",
    target: 1,
    rewardPercent: 25,
  },
  {
    title: "I'm an artist now",
    description: "Create your first outfit",
    category: "onboarding",
    type: "outfits_created",
    target: 1,
    rewardPercent: 25,
  },
  {
    title: "First fan",
    description: "Get your first follower",
    category: "onboarding",
    type: "followers_gained",
    target: 1,
    rewardPercent: 25,
  },
  {
    title: "Giving love",
    description: "Like your first post",
    category: "onboarding",
    type: "posts_liked",
    target: 1,
    rewardPercent: 25,
  },
  {
    title: "First generation",
    description: "Generate your first AI photo",
    category: "onboarding",
    type: "photos_generated",
    target: 1,
    rewardPercent: 40,
  },
  {
    title: "Preset explorer",
    description: "Try 3 different presets",
    category: "onboarding",
    type: "presets_used",
    target: 3,
    rewardPercent: 45,
  },

  // 2. Received likes (Popularity) - 6 quests
  {
    title: "Early fans",
    description: "Receive 10 likes",
    category: "popularity",
    type: "likes_received",
    target: 10,
    rewardPercent: 40,
  },
  {
    title: "Becoming famous",
    description: "Receive 50 likes",
    category: "popularity",
    type: "likes_received",
    target: 50,
    rewardPercent: 60,
  },
  {
    title: "Rising influencer",
    description: "Receive 100 likes",
    category: "popularity",
    type: "likes_received",
    target: 100,
    rewardPercent: 100,
  },
  {
    title: "Superstar",
    description: "Receive 250 likes",
    category: "popularity",
    type: "likes_received",
    target: 250,
    rewardPercent: 100,
  },
  {
    title: "Social star",
    description: "Receive 500 likes",
    category: "popularity",
    type: "likes_received",
    target: 500,
    rewardPercent: 150,
  },
  {
    title: "Couture's celebrity",
    description: "Receive 1000 likes",
    category: "popularity",
    type: "likes_received",
    target: 1000,
    rewardPercent: 200,
  },

  // 3. Photography (Generation) - 6 quests
  {
    title: "Model starter",
    description: "Generate 5 photos",
    category: "generation",
    type: "photos_generated",
    target: 5,
    rewardPercent: 25,
  },
  {
    title: "Groove model",
    description: "Generate 10 photos",
    category: "generation",
    type: "photos_generated",
    target: 10,
    rewardPercent: 50,
  },
  {
    title: "Content creator",
    description: "Generate 25 photos",
    category: "generation",
    type: "photos_generated",
    target: 25,
    rewardPercent: 125,
  },
  {
    title: "Virtual influencer",
    description: "Generate 50 photos",
    category: "generation",
    type: "photos_generated",
    target: 50,
    rewardPercent: 250,
  },
  {
    title: "Style master",
    description: "Generate 100 photos",
    category: "generation",
    type: "photos_generated",
    target: 100,
    rewardPercent: 500,
  },
  {
    title: "Drip legend",
    description: "Generate 500 photos",
    category: "generation",
    type: "photos_generated",
    target: 500,
    rewardPercent: 2500,
  },

  // 4. Social butterfly (Engagement) - 4 quests
  {
    title: "Supportive member",
    description: "Like 25 posts",
    category: "engagement",
    type: "posts_liked",
    target: 25,
    rewardPercent: 50,
  },
  {
    title: "Active supporter",
    description: "Like 200 posts",
    category: "engagement",
    type: "posts_liked",
    target: 100,
    rewardPercent: 100,
  },
  {
    title: "Community pillar",
    description: "Like 500 posts",
    category: "engagement",
    type: "posts_liked",
    target: 150,
    rewardPercent: 150,
  },
  {
    title: "The Backbone",
    description: "Like 1000 posts",
    category: "engagement",
    type: "posts_liked",
    target: 150,
    rewardPercent: 200,
  },

  // 5. Posted pics (Publication) - 6 quests
  {
    title: "Future celebrity",
    description: "Publish 5 posts",
    category: "publication",
    type: "posts_published",
    target: 5,
    rewardPercent: 25,
  },
  {
    title: "Solid base",
    description: "Publish 10 posts",
    category: "publication",
    type: "posts_published",
    target: 10,
    rewardPercent: 50,
  },
  {
    title: "Starting creator",
    description: "Publish 25 posts",
    category: "publication",
    type: "posts_published",
    target: 25,
    rewardPercent: 125,
  },
  {
    title: "Serious creator",
    description: "Publish 50 posts",
    category: "publication",
    type: "posts_published",
    target: 50,
    rewardPercent: 250,
  },
  {
    title: "Committed creator",
    description: "Publish 100 posts",
    category: "publication",
    type: "posts_published",
    target: 100,
    rewardPercent: 500,
  },
  {
    title: "Viral Creator",
    description: "Publish 200 posts",
    category: "publication",
    type: "posts_published",
    target: 200,
    rewardPercent: 1000,
  },

  // 6. Outfit mastery (Outfits) - 7 quests
  {
    title: "Getting started",
    description: "Create 5 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 5,
    rewardPercent: 25,
  },
  {
    title: "Style seeker",
    description: "Create 10 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 10,
    rewardPercent: 50,
  },
  {
    title: "Fashion enthusiast",
    description: "Create 25 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 25,
    rewardPercent: 100,
  },
  {
    title: "Style maven",
    description: "Create 50 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 50,
    rewardPercent: 125,
  },
  {
    title: "Fashion expert",
    description: "Create 100 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 100,
    rewardPercent: 175,
  },
  {
    title: "Wardrobe legend",
    description: "Create 200 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 200,
    rewardPercent: 200,
  },
  {
    title: "Ultimate stylist",
    description: "Create 500 outfits",
    category: "outfits_creator",
    type: "outfits_created",
    target: 500,
    rewardPercent: 325,
  },

  // 7. Preset collector (Presets) - 4 quests
  {
    title: "World traveler",
    description: "Use 5 different presets",
    category: "presets_collector",
    type: "presets_used",
    target: 5,
    rewardPercent: 25,
  },
  {
    title: "Universe hopper",
    description: "Use 10 different presets",
    category: "presets_collector",
    type: "presets_used",
    target: 10,
    rewardPercent: 50,
  },
  {
    title: "Dimension explorer",
    description: "Use 15 different presets",
    category: "presets_collector",
    type: "presets_used",
    target: 15,
    rewardPercent: 75,
  },
  {
    title: "Multiverse master",
    description: "Unlock all 20 presets",
    category: "presets_collector",
    type: "presets_used",
    target: 20,
    rewardPercent: 100,
  },

  // 8. Viral spreader (Sharing) - 4 quests
  {
    title: "First share",
    description: "Share 1 post",
    category: "sharing",
    type: "posts_shared",
    target: 1,
    rewardPercent: 100,
  },
  {
    title: "Spreading the word",
    description: "Share 3 posts",
    category: "sharing",
    type: "posts_shared",
    target: 3,
    rewardPercent: 150,
  },
  {
    title: "Viral starter",
    description: "Share 10 posts",
    category: "sharing",
    type: "posts_shared",
    target: 10,
    rewardPercent: 250,
  },
  {
    title: "Viral star",
    description: "Share 20 posts",
    category: "sharing",
    type: "posts_shared",
    target: 20,
    rewardPercent: 350,
  },
];

export const _internal = internalMutation({
  handler: async (ctx) => {
    // Get existing quests 
    const existingQuests = await ctx.db.query("quests").collect();

    let i = 0;
    for (const quest of existingQuests) {
      // Update the rewardCredits based on the rewardPercent if it has changed
      const foundQuest = quests.find((q) => q.title === quest.title);
      if (foundQuest) {
        const newRewardCredits = getCreditsAmount(foundQuest.rewardPercent);
        if (quest.rewardCredits !== newRewardCredits) {
          await ctx.db.patch(quest._id, {
            rewardCredits: newRewardCredits,
          })
          console.log(`✅ Updated quest "${quest.title}" from ${quest.rewardCredits} to ${newRewardCredits} rewardCredits`);
          i++;
        }
      }
    }

    console.log(`✅ Updated ${i} existing quests with new reward amounts`);

    // Insert all quests
    i = 0;
    for (const quest of quests) {
      const foundQuest = existingQuests.find((q) => q.title === quest.title);
      if (foundQuest) { continue }

      await ctx.db.insert("quests", {
        title: quest.title,
        description: quest.description,
        category: quest.category,
        type: quest.type,
        target: quest.target,
        rewardCredits: getCreditsAmount(quest.rewardPercent),
      });
      i++;
    }

    console.log(`✅ Successfully initialized ${i} quests`);
  },
})