import { Button } from "@ui/button"
import { Text } from "@ui/text"
import { ComponentProps, useState } from "react"
import { Platform, View } from "react-native"
import { Colors } from "theme"
import { BookmarkIcon, Camera, Download, HeartIcon, ImageIcon, Loader, ShareIcon, TShirt, User } from "../icons"
import { MenuGroup, MenuItem } from "../menu"
import { Modal } from "../modal"
import { Pressable } from "../pressable"

type RoundButtonProps = {
  title: string;
  icon: React.ComponentType<{ size?: number, color?: string, weight?: 'regular' | 'fill' }>;
  weight?: 'regular' | 'fill';
  onPress?: (() => Promise<void>) | (() => void);
}

const RoundButton = ({ title, icon, weight, onPress }: RoundButtonProps) => {
  const [loading, setLoading] = useState(false);
  const Icon = loading ? Loader : icon;

  return (
    <Pressable
      onPress={onPress ? async () => {
        setLoading(true);
        try { await onPress(); }
        finally { setLoading(false); }
      } : undefined}
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 92,
      }}
    >
      <View
        style={{
          padding: 16,
          borderRadius: 99,
          backgroundColor: Colors.blur.dark,
          borderColor: Colors.blur.medium,
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
          borderWidth: 1,
        }}
      >
        <Icon size={24} color={Colors.neutral[50]} weight={weight || "regular"} />
      </View>
      <Text.Sm color={Colors.neutral[200]} style={{ marginTop: 10 }}>
        {title}
      </Text.Sm>
    </Pressable>
  )
}

type Props = {
  liked?: boolean;
  onToggleLike?: (liked: boolean) => void;
  bookmarked?: boolean;
  onToggleBookmark?: (bookmarked: boolean) => void;
  onDownload?: () => Promise<void>;
  onShare?: () => void;
  onProfilePress?: () => void;
  onRecreate?: () => void;
  onOutfitPress?: () => void;
  onPresetPress?: () => void;
} & Omit<ComponentProps<typeof Modal>, 'children'>

export const PostMenu = ({ open, onOpenChange, ...props }: Props) => {
  const { liked, onToggleLike, bookmarked, onRecreate, onOutfitPress,
    onToggleBookmark, onShare, onProfilePress, onPresetPress, onDownload } = props;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <View
        style={{ paddingTop: 20 }}
      >
        {(onToggleLike || onToggleBookmark || onShare) && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {onToggleLike && <RoundButton
              title={liked ? "Liked" : "Like"}
              onPress={() => onToggleLike?.(!liked)}
              weight={liked ? "fill" : "regular"}
              icon={HeartIcon}
            />}
            {onToggleBookmark && <RoundButton
              title={bookmarked ? "Bookmarked" : "Bookmark"}
              onPress={() => onToggleBookmark?.(!bookmarked)}
              weight={bookmarked ? "fill" : "regular"}
              icon={BookmarkIcon}
            />}
            {onShare && <RoundButton
              title="Share"
              icon={ShareIcon}
              onPress={() => { onShare?.(); onOpenChange?.(false); }}
            />}
          </View>)}
        {(onOutfitPress || onRecreate) && <MenuGroup title="Quick Access" style={{ marginTop: 28 }}>
          {onRecreate && <MenuItem
            icon={Camera}
            text="Recreate look"
            variant="primary"
            onPress={() => { onRecreate?.(); onOpenChange?.(false); }}
          />}
          {onOutfitPress && <MenuItem
            icon={TShirt}
            text="Open outfit"
            variant="secondary"
            onPress={() => { onOutfitPress?.(); onOpenChange?.(false); }}
          />}
        </MenuGroup>}
        <MenuGroup title="More">
          {onPresetPress && <MenuItem
            icon={ImageIcon}
            text="View preset"
            onPress={() => { onPresetPress?.(); onOpenChange?.(false); }}
          />}
          {onProfilePress && <MenuItem
            icon={User}
            text="View profile"
            onPress={() => { onProfilePress?.(); onOpenChange?.(false); }}
          />}
          {onDownload && <MenuItem
            icon={Download}
            text="Download"
            rightIcon={false}
            onPress={async () => { await onDownload?.(); onOpenChange?.(false); }}
          />}
        </MenuGroup>
        <Button
          variant="blur"
          style={{ marginBottom: Platform.OS === 'ios' ? 20 : 12 }}
          onPress={() => onOpenChange?.(false)}
        >
          Close
        </Button>
      </View>
    </Modal >
  )
}