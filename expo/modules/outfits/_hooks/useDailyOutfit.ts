import { api, Doc, Id } from "@/lib/convex/api";
import { useQueryCached } from "@/lib/convex/client";
import { createJotaiStorage } from "@/lib/convex/storage";
import { notEmpty } from "@utils/convex-allowed";
import { useConvex } from "convex/react";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage, loadable } from 'jotai/utils';

const itemsAtom = atomWithStorage<Id<'items'>[]>('daily-outfit-items', [], createJotaiStorage());
const loadableItemsAtom = loadable(itemsAtom);
const isRandomizingAtom = atom(false);

type SharedSettings = {
  styles: Doc<'items'>['styles'];
  palettes: { colors: string[] }[];
}

type Settings = {
  seed: string;
  allowPublicOutfits: boolean;
  public: SharedSettings;
  private: SharedSettings;
}

const DEFAULT_SETTINGS: Settings = {
  seed: `${new Date().getDate()}`,
  allowPublicOutfits: true,
  public: {
    styles: [],
    palettes: [],
  },
  private: {
    styles: [],
    palettes: [],
  },
}

const settingsAtom = atomWithStorage<Settings>('daily-outfit-settings', DEFAULT_SETTINGS, createJotaiStorage());

export const useDailyOutfit = () => {
  const [, setItems] = useAtom(itemsAtom);
  const itemsLoadable = useAtomValue(loadableItemsAtom);

  // Guard: while loading or error, use empty array
  const items = itemsLoadable.state === 'hasData' ? itemsLoadable.data : [];

  return { items, setItems };
}

const useSettings = () => {
  const convex = useConvex();
  const [, setItems] = useAtom(itemsAtom);

  const { data: settings } = useQueryCached(api.router.outfits.suggestOne.settings);

  const [isRandomizing, setIsRandomizing] = useAtom(isRandomizingAtom);
  const [settingsState, setSettingsState] = useAtom(settingsAtom);

  const _palettes = settingsState.allowPublicOutfits ? settingsState.public.palettes : settingsState.private.palettes;
  const _styles = settingsState.allowPublicOutfits ? settingsState.public.styles : settingsState.private.styles;

  // Filter palettes and styles based on what convex returns
  const palettes = settings?.palettes ?
    _palettes.filter(p => settings?.palettes.some(sp => sp.colors.sort().join(',') === p.colors.sort().join(','))) : _palettes;
  const styles = settings?.styles ?
    _styles.filter(s => settings?.styles.includes(s)) : _styles;

  const allowPublicOutfits = settingsState.allowPublicOutfits;
  const seed = settingsState.seed;

  const setSeed = (newSeed: string) => { setSettingsState(async (prev) => ({ ...(await prev), seed: newSeed })); }
  const setAllowPublicOutfits = (value: boolean) => { setSettingsState({ ...settingsState, allowPublicOutfits: value }); };

  const setPalettes = (newPalettes: (prev: { colors: string[] }[]) => { colors: string[] }[]) => {
    const newSettings = settingsState.allowPublicOutfits
      ? { ...settingsState, public: { ...settingsState.public, palettes: newPalettes(palettes) } }
      : { ...settingsState, private: { ...settingsState.private, palettes: newPalettes(palettes) } };
    setSettingsState(newSettings);
  };

  const setStyles = (newStyles: (prev: Doc<'items'>['styles']) => Doc<'items'>['styles']) => {
    const newSettings = settingsState.allowPublicOutfits
      ? { ...settingsState, public: { ...settingsState.public, styles: newStyles(styles) } }
      : { ...settingsState, private: { ...settingsState.private, styles: newStyles(styles) } };
    setSettingsState(newSettings);
  };

  const updateSeed = () => {
    const newSeed = `${Number(seed) + 1}`;
    setSeed(newSeed);
    return newSeed;
  }

  const randomize = async () => {
    setIsRandomizing(true);

    const finalPalettes = palettes.length > 0 ? palettes : undefined;
    const finalStyles = styles.length > 0 ? styles : undefined;
    const finalSeed = updateSeed();

    const outfit = await convex.query(api.router.outfits.suggestOne.authed, {
      seed: finalSeed,
      hexPalettes: finalPalettes?.map((p) => p.colors),
      styles: finalStyles,
      allowPublicOutfits,
    })

    setIsRandomizing(false);

    if (!outfit) return false;

    setSeed(`${outfit.seed}`);

    const itemIds = outfit.items
      .filter(notEmpty).map((item) => item._id);

    setItems(itemIds);

    return true;
  }

  return {
    settings,
    isRandomizing, randomize,
    allowPublicOutfits, setAllowPublicOutfits,
    palettes, setPalettes,
    styles, setStyles,
    seed, updateSeed,
  }
}

useDailyOutfit.Settings = useSettings;