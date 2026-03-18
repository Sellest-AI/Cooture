import { api, Id } from "@/lib/convex/api";
import { useAction, useMutation, usePaginatedQuery, useQueryCached } from "@/lib/convex/client";
import { useUpload } from "@/lib/convex/upload";
import { compressImage } from "@/lib/image/client/editing";
import { atom, useAtom } from "jotai";
import { useEffect, useMemo } from "react";

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



type PendingItem = {
  key: string;
  url: string;
  name?: string;
  brand?: string;
  description?: string;
  /** Main image */
  image: { url: string, width: number, height: number };
  createdAt: number;
}

const pendingItemsAtom = atom<PendingItem[]>([]);

export const useCreateItem = () => {
  const { uploadImage } = useUpload();
  const { action: removeBackground } = useAction(api.llm.triggers.removeBackground.authed);
  const { action: createItem } = useAction(api.router.items.createOne.authed);

  const [pendingItems, setPendingItems] = useAtom(pendingItemsAtom);

  const oldestCreatedAt = useMemo(() => {
    if (pendingItems.length === 0) return null;
    // Find oldest pending item creation time to set as started time
    return pendingItems.reduce((oldest, item) => item.createdAt < oldest ? item.createdAt : oldest, new Date().getTime());
  }, [pendingItems]);

  const { results } = usePaginatedQuery(api.router.items.getPaginated.authed, {}, { initialNumItems: 8 });
  const newItems = useMemo(() => oldestCreatedAt ? results.filter((i) => i._creationTime > oldestCreatedAt) : [], [oldestCreatedAt, results]);

  const create = async (item: PendingItem) => {
    // Prevent creating the same item multiple times
    if (pendingItems.find(i => i.key === item.key)) return item.key;

    const compressed = await compressImage(item.image.url, { maxResolution: 2048, keepMimeType: false });
    const base64 = await compressed.toBase64();
    const { hasAlpha } = await removeBackground({
      base64: base64,
      nextStep: 'CREATE_ITEM',
      nextArgs: {
        CREATE_ITEM: {
          brand: item.brand,
          name: item.name,
          description: item.description,
          itemUrl: item.url,
        }
      }
    });

    if (hasAlpha) {
      const image = await uploadImage(compressed.uri);
      createItem({
        imageId: image._id,
        metadata: {
          name: item.name,
          description: item.description,
          itemUrl: item.url,
        }
      })
    }

    setPendingItems((prev) => [...prev, {
      key: item.key,
      url: item.url,
      name: item.name,
      description: item.description,
      image: item.image,
      createdAt: item.createdAt,
    }]);

    return item.key;
  }

  const reset = () => {
    setPendingItems([]);
  }

  return { create, newItems, pendingItems, reset }
}

useItem.Create = useCreateItem;