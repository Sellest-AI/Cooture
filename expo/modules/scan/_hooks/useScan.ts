import { atom, useAtom } from 'jotai';

const imageScannedAtom = atom<string | null>(null);

export const useScan = () => {
  const [imageScanned, setImageScanned] = useAtom(imageScannedAtom);
  return { imageScanned, setImageScanned };
}