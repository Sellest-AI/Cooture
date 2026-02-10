/**
 * Instagram-like Feed Algorithm
 * 
 * Features:
 * - Sorts items by recency (newer items generally at top)
 * - Adds controlled randomness so items aren't strictly chronological
 * - Ensures outfits appear roughly every 4 posts (not too frequent)
 */

type Item<T extends string> = {
  _id: T;
  type: 'post' | 'outfit'; // 'post' or 'outfit'
  _creationTime: number;
}

export class FeedAlgorithm {
  shuffleStrength: number;
  minPostsBetweenOutfits: number;
  recencyDecay: number;

  constructor(options: { shuffleStrength?: number; minPostsBetweenOutfits?: number; recencyDecay?: number } = {}) {
    // How much randomness to add (0-1, where 0 = pure chronological, 1 = very random)
    this.shuffleStrength = options.shuffleStrength || 0.3;

    // Minimum posts between outfits
    this.minPostsBetweenOutfits = options.minPostsBetweenOutfits || 4;

    // Recency decay factor (higher = older items drop faster)
    this.recencyDecay = options.recencyDecay || 0.5;
  }

  /**
   * Calculate a score for an item based on recency and randomness
   * @param {Object} item - The item (post or outfit)
   * @param {Date} now - Current timestamp
   * @returns {number} Score (higher = more likely to be at top)
   */
  calculateScore<T extends { _creationTime: number }>(item: T, now: Date): number {
    const ageInHours = (now.getTime() - new Date(item._creationTime).getTime()) / (1000 * 60 * 60);

    // Base recency score (decays over time)
    // Newer items get higher scores
    const recencyScore = Math.exp(-ageInHours * this.recencyDecay / 24);

    // Random factor (0.7 to 1.3 multiplier for some shuffle)
    const randomFactor = 1 + (Math.random() - 0.5) * this.shuffleStrength * 2;

    return recencyScore * randomFactor;
  }

  /**
   * Generate the feed with proper outfit spacing
   * @param {Array} items - Array of posts and outfits with {type, _creationTime, ...}
   * @returns {Array} Sorted feed
   */

  generateFeed<T extends string>(items: Item<T>[]) {
    if (!items || items.length === 0) return [];

    const now = new Date();

    // Separate posts and outfits
    const posts = items.filter(item => item.type === 'post');
    const outfits = items.filter(item => item.type === 'outfit');

    // Score all items
    const scoredPosts = posts.map(post => ({
      ...post,
      score: this.calculateScore(post, now)
    }));

    const scoredOutfits = outfits.map(outfit => ({
      ...outfit,
      score: this.calculateScore(outfit, now)
    }));

    // Sort by score (highest first)
    scoredPosts.sort((a, b) => b.score - a.score);
    scoredOutfits.sort((a, b) => b.score - a.score);

    // Interleave outfits with posts
    const feed = [];
    let postIndex = 0;
    let outfitIndex = 0;
    let postsSinceLastOutfit = 0;

    while (postIndex < scoredPosts.length || outfitIndex < scoredOutfits.length) {
      // Decide whether to add an outfit or post
      const shouldAddOutfit =
        outfitIndex < scoredOutfits.length &&
        postsSinceLastOutfit >= this.minPostsBetweenOutfits;

      if (shouldAddOutfit) {
        feed.push(scoredOutfits[outfitIndex]);
        outfitIndex++;
        postsSinceLastOutfit = 0;
      } else if (postIndex < scoredPosts.length) {
        feed.push(scoredPosts[postIndex]);
        postIndex++;
        postsSinceLastOutfit++;
      } else if (outfitIndex < scoredOutfits.length) {
        // No more posts, add remaining outfits
        feed.push(scoredOutfits[outfitIndex]);
        outfitIndex++;
      }
    }

    // Remove score property before returning
    return feed.map(({ score, ...item }) => item);
  }

  /**
   * Alternative approach: Simple weighted shuffle
   * Better for when you want more randomness but still bias toward recent
   */
  generateFeedSimple<T extends string>(items: Item<T>[]) {
    if (!items || items.length === 0) return [];

    const now = new Date();

    // Score all items
    const scoredItems = items.map(item => ({
      ...item,
      score: this.calculateScore(item, now)
    }));

    // Sort by score
    scoredItems.sort((a, b) => b.score - a.score);

    // Now apply outfit spacing constraint
    const feed: (Item<T> & { score: number })[] = [];
    const posts: (Item<T> & { score: number })[] = [];
    const outfits: (Item<T> & { score: number })[] = [];

    scoredItems.forEach(item => {
      if (item.type === 'post') {
        posts.push(item);
      } else {
        outfits.push(item);
      }
    });

    let postIndex = 0;
    let outfitIndex = 0;
    let postsSinceLastOutfit = 0;

    while (postIndex < posts.length || outfitIndex < outfits.length) {
      const shouldAddOutfit =
        outfitIndex < outfits.length &&
        postsSinceLastOutfit >= this.minPostsBetweenOutfits;

      if (shouldAddOutfit) {
        feed.push(outfits[outfitIndex]);
        outfitIndex++;
        postsSinceLastOutfit = 0;
      } else if (postIndex < posts.length) {
        feed.push(posts[postIndex]);
        postIndex++;
        postsSinceLastOutfit++;
      } else if (outfitIndex < outfits.length) {
        feed.push(outfits[outfitIndex]);
        outfitIndex++;
      }
    }

    return feed.map(({ score, ...item }) => item);
  }
}