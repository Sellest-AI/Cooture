import { api, Id } from "@/lib/convex/api";
import { useMutation, useQueryCached } from "@/lib/convex/client";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const itemIdAtom = atom<Id<'items'> | null>(null);

export const useItem = (_id?: Id<'items'> | null) => {
  const [fallbackId, setId] = useAtom(itemIdAtom);
  useEffect(() => { if (_id) setId(_id) }, [_id, setId])
  const id = _id || fallbackId;

  const { data: item, isPending } = useQueryCached(api.router.items.getOne.anon, id ? { itemId: id } : 'skip');
  const { mutate } = useMutation(api.router.items.editOne.authed);

  const update = (data: Omit<Parameters<typeof mutate>[0], 'itemId'>) => {
    if (!id) return;
    return mutate({ ...data, itemId: id });
  }

  return {
    item,
    isLoading: isPending,
    update
  }
}