import { getTagsFromHexColors } from "@/lib/color";
import { en, Faker } from "@faker-js/faker";
import { Infer } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { ITEM_CATEGORIES, ITEM_GENDERS, ITEM_WEATHERS } from "../../schema/items";
import { extractPosition, Position } from "../items/extractPosition";

export type WeatherTag = Infer<typeof ITEM_WEATHERS>;
export type GenderTag = Infer<typeof ITEM_GENDERS>;

export type GroupedPositions = Record<Position, {
  id: Id<"items">;
  category: typeof ITEM_CATEGORIES[number];
  colors: string[];      // color tags, e.g. ["black", "white"]
  weatherTags: string[]; // e.g. ["COLD", "SNOWY"]
  gender: GenderTag;     // "MALE" | "FEMALE" | "UNISEX"
}[]>;

type Item = GroupedPositions[Position][number];

const WEATHER_OPTIONS: WeatherTag[] = ["COLD", "WARM", "HOT", "RAINY", "SNOWY", "SUNNY", "WINDY"];
const GENDER_OPTIONS: ("MALE" | "FEMALE")[] = ["MALE", "FEMALE"];

type Options = {
  targetCount: number;
  baseSeed: number;
  weather?: WeatherTag;
  gender?: "MALE" | "FEMALE";
}

// Returns HSL lightness [0,1] for sorting palette dark → light
function hexLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

const BOTTOM_CATS = ["BOTTOM", "JEANS", "SKIRT"] as string[];
const TOP_AREA_CATS = ["TOP", "SWEATER", "TSHIRT", "OUTERWEAR", "JACKET", "HOODIE"] as string[];

export const buildOutfitCombinations = (
  palette: string[],
  positions: GroupedPositions,
  options: Options,
): Id<"items">[][] => {
  const { targetCount, baseSeed } = options;

  // Use a seeded faker for the session context so generation is fully reproducible from baseSeed
  const sessionFaker = new Faker({ locale: en });
  sessionFaker.seed(baseSeed);

  // Pick context for this generation session (weather + gender), then filter all item pools
  const sessionWeather = options.weather ?? sessionFaker.helpers.arrayElement(WEATHER_OPTIONS);
  const sessionGender = options.gender ?? sessionFaker.helpers.arrayElement(GENDER_OPTIONS);

  const isColdWeather = sessionWeather === "COLD" || sessionWeather === "SNOWY";

  const contextFilter = (item: Item) => {
    // T-shirts are always allowed regardless of weather — outerwear will cover them when cold
    const weatherOk = item.category === "TSHIRT" || item.weatherTags.length === 0 || item.weatherTags.includes(sessionWeather);
    const genderOk = item.gender === "UNISEX" || item.gender === sessionGender;
    return weatherOk && genderOk;
  };

  const allTops = (positions.TOP ?? []).filter(contextFilter);
  const allBottoms = (positions.BOTTOM ?? []).filter(contextFilter);
  const allShoes = (positions.SHOES ?? []).filter(contextFilter);
  const allInnerlayers = (positions.INNERLAYER ?? []).filter(contextFilter);
  const allOuterwears = (positions.OUTERWEAR ?? []).filter(contextFilter);
  const allAccessories = (positions.ACCESSORY ?? []).filter(contextFilter);

  // Sort palette darkest → lightest by HSL lightness
  const sortedPalette = [...palette]
    .map(hex => ({
      lightness: hexLightness(hex),
      tag: getTagsFromHexColors([hex])[0] ?? "black",
    }))
    .sort((a, b) => a.lightness - b.lightness);

  // Color role assignment:
  //   3-color: darkTag → bottom (enforced), randomly assign mid/light to clothes vs accessories
  //   2-color: both colors can flip — either can be bottom or top/shoes (randomly per attempt)
  const darkTag = sortedPalette[0]!.tag;
  const lightTag = sortedPalette[sortedPalette.length - 1]!.tag;
  const midTag = sortedPalette.length >= 3 ? sortedPalette[1]!.tag : null;

  // Early exit: check if any valid outfit structure is possible before starting the loop
  if (midTag) {
    // 3-color: darkTag is always the bottom — check both possible clothes/accessory assignments
    const darkBottoms3 = allBottoms.filter(b => b.colors.includes(darkTag));
    const canAny = [midTag, lightTag].some(clothesColor => {
      const hasBottom = darkBottoms3.length > 0;
      const hasTop = allTops.some(t => t.category !== "DRESS" && t.colors.includes(clothesColor))
        || allInnerlayers.some(i => i.colors.includes(clothesColor));
      const hasShoe = allShoes.some(s => s.colors.includes(clothesColor));
      const canDress = allTops.some(t => t.category === "DRESS" && t.colors.includes(clothesColor))
        && hasShoe;
      return (hasBottom && hasTop && hasShoe) || canDress;
    });
    if (!canAny) return [];
  } else {
    // 2-color: either color can be the bottom — check both assignments
    const canAnyRegular = [darkTag, lightTag].some(bottomColor => {
      const clothesColor = bottomColor === darkTag ? lightTag : darkTag;
      const hasBottom = allBottoms.some(b => b.colors.includes(bottomColor));
      const hasTop = allTops.some(t => t.category !== "DRESS" && t.colors.includes(clothesColor))
        || allInnerlayers.some(i => i.colors.includes(clothesColor));
      const hasShoe = allShoes.some(s => s.colors.includes(clothesColor));
      return hasBottom && hasTop && hasShoe;
    });
    const canAnyDress = [darkTag, lightTag].some(clothesColor =>
      allTops.some(t => t.category === "DRESS" && t.colors.includes(clothesColor))
      && allShoes.some(s => s.colors.includes(clothesColor))
    );
    if (!canAnyRegular && !canAnyDress) return [];
  }

  const faker = new Faker({ locale: en });
  let seed = baseSeed;
  const results: Id<"items">[][] = [];
  let generated = 0;
  let attempts = 0;
  const maxAttempts = targetCount * 10;

  const sample = <T>(arr: T[]): T | null => {
    if (!arr.length) return null;
    return faker.helpers.arrayElement(arr);
  };

  while (generated < targetCount && attempts < maxAttempts) {
    attempts++;
    seed = seed * 16807 + attempts;
    faker.seed(seed);

    // Determine color roles for this attempt:
    //   3-color: darkTag is always the bottom; randomly split mid/light between clothes and accessories
    //   2-color: randomly flip which color is bottom vs clothes (both directions are valid)
    let bottomTag: string;
    let clothesTag: string;
    let accessoryTags: string[];

    if (midTag) {
      bottomTag = darkTag;
      const useMid = faker.datatype.boolean();
      clothesTag = useMid ? midTag : lightTag;
      accessoryTags = [useMid ? lightTag : midTag];
    } else {
      const flipColors = faker.datatype.boolean();
      bottomTag = flipColors ? lightTag : darkTag;
      clothesTag = flipColors ? darkTag : lightTag;
      accessoryTags = [lightTag, darkTag];
    }

    const validBottoms = allBottoms.filter(b => b.colors.includes(bottomTag));
    const validOuterwears = allOuterwears.filter(o => o.colors.includes(bottomTag) || o.colors.includes(clothesTag));
    const validRegularTops = allTops.filter(t => t.category !== "DRESS" && t.colors.includes(clothesTag));
    const validDresses = allTops.filter(t => t.category === "DRESS" && t.colors.includes(clothesTag));
    const validInnerlayers = allInnerlayers.filter(i => i.colors.includes(clothesTag));
    const validShoes = allShoes.filter(s => s.colors.includes(clothesTag));

    // Shoes must match the clothes color — no shoes in the right color means no valid outfit
    if (!validShoes.length) continue;

    const validTemplates: string[] = [];
    if (validDresses.length > 0) validTemplates.push("DRESS");
    if (validRegularTops.length > 0 && validBottoms.length > 0) validTemplates.push("REGULAR");
    if (validInnerlayers.length > 0 && validBottoms.length > 0) validTemplates.push("INNER_OUTER");

    if (!validTemplates.length) continue;

    const template = faker.helpers.arrayElement(validTemplates);
    const outfitItems: Item[] = [];

    outfitItems.push(sample(validShoes)!);

    if (template === "DRESS") {
      outfitItems.push(sample(validDresses)!);
    } else if (template === "REGULAR") {
      outfitItems.push(sample(validRegularTops)!);
      outfitItems.push(sample(validBottoms)!);
    } else {
      // INNER_OUTER: innerlayer in clothes color, outerwear in bottom color wraps it
      outfitItems.push(sample(validInnerlayers)!);
      outfitItems.push(sample(validBottoms)!);
      if (validOuterwears.length > 0) {
        outfitItems.push(sample(validOuterwears)!);
      }
    }

    if (template === 'DRESS' || template === 'REGULAR') {
      // In cold weather outerwear is required; otherwise add it randomly
      if (isColdWeather) {
        if (!validOuterwears.length) continue;
        outfitItems.push(sample(validOuterwears)!);
      } else if (validOuterwears.length > 0 && faker.datatype.boolean()) {
        outfitItems.push(sample(validOuterwears)!);
      }
    }

    // Accessories: color-matched, randomly added (0–2)
    const validAccs = allAccessories.filter(a => a.colors.some(c => accessoryTags.includes(c)));
    const needAccessory = !outfitItems.some((i) => extractPosition(i.category) === 'OUTERWEAR');
    if (validAccs.length > 0 && (faker.datatype.boolean() || needAccessory)) {
      const acc1 = sample(validAccs)!;
      outfitItems.push(acc1);
      // If we added an accessory, try to add a second one that doesn't share the same category
      const remaining = validAccs.filter(a => a.id !== acc1.id && a.category !== acc1.category);
      if (remaining.length > 0 && faker.datatype.boolean()) {
        outfitItems.push(sample(remaining)!);
      }
    }

    // Deduplicate by id
    const seen = new Set<Id<"items">>();
    const unique = outfitItems.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    // Validate required structure: shoes + (dress alone, or top-area + bottom)
    const hasDress = unique.some(i => i.category === "DRESS");
    const hasTopArea = unique.some(i => TOP_AREA_CATS.includes(i.category));
    const hasBottom = unique.some(i => BOTTOM_CATS.includes(i.category));
    const hasShoeItem = unique.some(i => i.category === "SHOES");

    if (!hasShoeItem || !(hasDress || (hasTopArea && hasBottom))) continue;

    results.push(unique.map(i => i.id));
    generated++;
  }

  return results;
};
