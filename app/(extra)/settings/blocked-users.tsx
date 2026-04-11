import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useQuery } from "@/lib/convex/client";
import { useSafety } from "@/modules/safety";
import { EmptyBlock } from "@ui/block.empty";
import { Button } from "@ui/button";
import { FlashList } from "@ui/flat-list";
import { UserRoundX } from "@ui/icons";
import { MenuItemCheck } from "@ui/menu";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

type UserProps = {
  userId: Id<'users'>;
  selected?: boolean;
  onPress?: () => void;
}
const UserItem = ({ userId, selected, onPress }: UserProps) => {
  const { data: user } = useQuery(api.router.users.getAccount.anon, { userId });

  if (!user) return <Skeleton style={{ height: 56, marginBottom: 8 }} />

  return (
    <MenuItemCheck
      icon={UserRoundX}
      text={`@${user.username}`}
      selected={selected}
      onPress={onPress}
    />
  )
}

export default function Screen() {
  const { user } = useAccount();
  const { unblockUser, blockedContents: { blockedUsers } } = useSafety();

  const [userToUnblock, setUserToUnblock] = useState<Id<'users'> | null>(null);

  if (!user) return null;

  return (
    <SafeAreaView style={{
      paddingHorizontal: 12,
      flex: 1
    }}
    >
      <FlashList
        data={blockedUsers}
        renderItem={({ item }) => <UserItem
          selected={userToUnblock === item}
          onPress={() => {
            setUserToUnblock(userToUnblock === item ? null : item);
          }}
          userId={item}
        />}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <ModalHeader
            title="Blocked Users"
            onBack={router.canGoBack() ? router.back : undefined}
            style={{ marginBottom: 24 }}
          />}
        ListEmptyComponent={
          <EmptyBlock
            style={{ minHeight: 400 }}
            icon={UserRoundX}
            title="No Blocked Users"
            description="Users you block won't be able to see your content or interact with you."
          />
        }
      />
      {blockedUsers.length > 0 && <View>
        <Button
          variant="primary"
          disabled={!userToUnblock}
          onPress={() => {
            if (!userToUnblock) return;
            unblockUser(userToUnblock);
            setUserToUnblock(null);
          }}
        >
          Unblock
        </Button>
      </View>}
    </SafeAreaView>
  )
}