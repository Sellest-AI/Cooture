import { LoaderCircle } from 'lucide-react-native';
import type { ComponentProps } from 'react';

type LoaderProps = ComponentProps<typeof LoaderCircle>;
export const Loader = (props: LoaderProps) => <LoaderCircle {...props} className={`${props.className} animate-spin`} />;

export { IconSymbol } from './icon-symbol';

export { Explozish } from './explozish';
export { Roundish } from './roundish';

export {
  ArrowLeft, ArrowUpRight, Bell, Bookmark, Camera, Check, Compass, Gem, Home, Pause, Play, Plus, Rewind, ScanLine, Settings, Shapes, SkipBack, SkipForward, User, X
} from 'lucide-react-native';

