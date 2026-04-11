import { Text } from "@ui/text"
import { ComponentProps, useState } from "react"
import { View } from "react-native"
import { Colors } from "theme"
import { BookmarkIcon, Camera, Download, Loader, ShareIcon, TriangleAlert, TShirt, User, UserRoundX } from "../icons"
import { MenuGroup, MenuItem } from "../menu"
import { Modal } from "../modal"
import { Pressable } from "../pressable"
import { ReportConfig, ReportModal } from "./report.modal"

type RoundButtonProps = {
  title: string;
  icon: React.ComponentType<{ size?: number, color?: string, weight?: 'regular' | 'fill' }>;
  weight?: 'regular' | 'fill';
  onPress?: (() => Promise<void>) | (() => void);
  variant?: 'blur' | 'destructive'
}

const RoundButton = ({ title, icon, weight, onPress, variant = 'blur' }: RoundButtonProps) => {
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
          backgroundColor: variant === 'destructive' ? Colors.destructive[500] : Colors.blur.dark,
          borderColor: variant === 'destructive' ? Colors.destructive[500] : Colors.blur.medium,
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
          borderWidth: 1,
        }}
      >
        <Icon size={24}
          color={variant === "destructive" ? Colors.destructive[50] : Colors.neutral[50]}
          weight={weight || "regular"}
        />
      </View>
      <Text.Sm
        weight={500}
        color={variant === "destructive" ? Colors.destructive[500] : Colors.neutral[400]}
        style={{ marginTop: 10 }}>
        {title}
      </Text.Sm>
    </Pressable>
  )
}

type Props = {
  bookmarked?: boolean;
  onToggleBookmark?: (bookmarked: boolean) => void;
  onDownload?: () => Promise<void>;
  onShare?: () => void;
  onProfilePress?: () => void;
  onRecreate?: () => void;
  onOutfitPress?: () => void;
  report?: ReportConfig;
} & Omit<ComponentProps<typeof Modal>, 'children'>

export const PostMenu = ({ open, onOpenChange, ...props }: Props) => {
  const { bookmarked, onRecreate, onOutfitPress,
    onToggleBookmark, onShare, onProfilePress, onDownload, report } = props;

  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
      >
        <View
          style={{ paddingTop: 20 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {onShare && <RoundButton
              title="Share"
              icon={ShareIcon}
              onPress={() => { onShare?.(); onOpenChange?.(false); }}
            />}
            {onToggleBookmark && <RoundButton
              title={bookmarked ? "Bookmarked" : "Bookmark"}
              onPress={() => onToggleBookmark?.(!bookmarked)}
              weight={bookmarked ? "fill" : "regular"}
              icon={BookmarkIcon}
            />}
            {onDownload && <RoundButton
              title="Download"
              icon={Download}
              onPress={async () => { await onDownload?.(); onOpenChange?.(false); }}
            />}
            {(onProfilePress && !onDownload) && <RoundButton
              title="Profile"
              icon={User}
              onPress={() => { onProfilePress?.(); onOpenChange?.(false); }}
            />}
          </View>
          {(onOutfitPress || onRecreate) && <MenuGroup title="Quick Access" style={{ marginTop: 40, paddingHorizontal: 8 }}>
            {onRecreate && <MenuItem
              icon={Camera}
              text="Recreate look"
              variant="primary"
              onPress={() => { onRecreate?.(); onOpenChange?.(false); }}
            />}
            {onOutfitPress && <MenuItem
              icon={TShirt}
              text="Open outfit"
              onPress={() => { onOutfitPress?.(); onOpenChange?.(false); }}
            />}
          </MenuGroup>}
          {report && <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 12, gap: 48, marginTop: 8, marginBottom: 12 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              onPress={() => { setReportModalOpen(true); onOpenChange?.(false); }}
            >
              <TriangleAlert size={16} color={Colors.destructive[500]} />
              <Text.Base color={Colors.destructive[500]} weight={500}>Report content</Text.Base>
            </Pressable>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              onPress={() => { report?.onBlock?.(); onOpenChange?.(false); }}
            >
              <UserRoundX size={16} color={Colors.destructive[500]} />
              <Text.Base color={Colors.destructive[500]} weight={500}>Block user</Text.Base>
            </Pressable>
          </View>}
        </View>
      </Modal>
      {(report && !open) && <ReportModal
        open={reportModalOpen}
        report={report}
        onComplete={() => { setReportModalOpen(false); }}
        onCancel={() => { setReportModalOpen(false); }}
      />}
    </>
  )
}