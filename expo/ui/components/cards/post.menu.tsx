import { Button } from "@ui/button"
import { SafeAreaView } from "@ui/safe-area-view"
import { Text } from "@ui/text"
import { ComponentProps } from "react"
import { Platform, View } from "react-native"
import { Colors } from "theme"
import { BookmarkIcon, Camera, HeartIcon, ImageIcon, ShareIcon, TShirt, User } from "../icons"
import { MenuGroup, MenuItem } from "../menu"
import { Modal } from "../modal"
import { Pressable } from "../pressable"

type RoundButtonProps = {
  title: string;
  icon: React.ComponentType<{ size?: number, color?: string, weight?: 'regular' | 'fill' }>;
  weight?: 'regular' | 'fill';
  onPress?: () => void;
}

const RoundButton = ({ title, icon, weight, onPress }: RoundButtonProps) => {
  const Icon = icon;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 96,
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
  onShare?: () => void;
  onProfilePress?: () => void;
  onRecreate?: () => void;
  onOutfitPress?: () => void;
  onPresetPress?: () => void;
} & Omit<ComponentProps<typeof Modal>, 'children'>

export const PostMenu = ({ open, onOpenChange, ...props }: Props) => {
  const { liked, onToggleLike, bookmarked, onRecreate, onOutfitPress,
    onToggleBookmark, onShare, onProfilePress, onPresetPress } = props;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      scrollable={false}
    >
      <SafeAreaView
        edges={{ top: 'off', bottom: 'android' }}
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
          {onShare && <MenuItem
            icon={ShareIcon}
            text="Share post"
            rightIcon={false}
            onPress={() => { onShare?.(); onOpenChange?.(false); }}
          />}
        </MenuGroup>
        <Button
          variant="blur"
          style={{ marginBottom: Platform.OS === 'ios' ? 20 : 12 }}
          onPress={() => onOpenChange?.(false)}
        >
          Close
        </Button>
      </SafeAreaView>
    </Modal >
  )
}