import { LoaderCircle } from 'lucide-react-native';
import type { ComponentProps } from 'react';

type LoaderProps = ComponentProps<typeof LoaderCircle>;
export const Loader = (props: LoaderProps) => <LoaderCircle {...props} className={`${props.className} animate-spin`} />;

export { IconSymbol } from './icon-symbol';

export { ArrowLeft, Pause, Play, Plus, Rewind, SkipBack, SkipForward, X } from 'lucide-react-native';

