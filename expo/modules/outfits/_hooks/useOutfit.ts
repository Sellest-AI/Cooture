import { api, Id, useMutation, useQuery } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";

const outfitIdAtom = atom<Id<'outfits'> | null>(null);
export const useOutfit = (_id?: Id<'outfits'> | null) => {
  const [fallbackId, setId] = useAtom(outfitIdAtom);
  useEffect(() => { if (_id) setId(_id) }, [_id, setId])
  const id = _id || fallbackId;

  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, id ? { outfitId: id } : 'skip');

  const { mutate: update } = useMutation(api.router.outfits.editOne.authed);
  const { mutate: removeOutfit } = useMutation(api.router.outfits.deleteOne.authed);

  const updateName = async (name: string) => {
    if (!id) return;
    await update({ outfitId: id, name });
  }

  const updateItems = async (items: Id<'items'>[]) => {
    if (!id) return;
    await update({ outfitId: id, items });
  }

  const remove = async () => {
    if (!id) return;
    await removeOutfit({ outfitId: id });
  }

  return {
    outfit,
    updateName,
    updateItems,
    remove
  }
}


const nameAtom = atom('');
const itemsAtom = atom<Id<'items'>[]>([]);
const useNewOutfit = () => {
  const [name, setName] = useAtom(nameAtom);
  const [items, setItems] = useAtom(itemsAtom);

  const { mutate } = useMutation(api.router.outfits.createOne.authed);

  const reset = useCallback(() => {
    setName('');
    setItems([]);
  }, [setItems, setName]);

  const saveOutfit = async () => {
    const finalName = name.trim() || 'New Outfit';
    const outfitId = await mutate({ name: finalName, items });
    reset();
    return outfitId;
  }

  return {
    reset,
    saveOutfit,
    name,
    setName,
    items,
    setItems,
  }
}

useOutfit.New = useNewOutfit;