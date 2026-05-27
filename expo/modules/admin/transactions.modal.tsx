import { api, Id, useQuery } from "@/lib/convex/client"
import { Block } from "@ui/block"
import { Credits } from "@ui/icons"
import { Modal } from "@ui/modal"
import { Text } from "@ui/text"
import { useMemo } from "react"
import { View } from "react-native"
import { Colors } from "theme"


type Props = {
  userId: Id<'users'>;
  open: boolean;
  onClose: () => void;
}

export const TransactionsModal = ({ userId, open, onClose }: Props) => {
  const { data: transactions } = useQuery(api.router.admin.users.getTransactions.admin, { userId });
  const { data: wallet } = useQuery(api.router.credits.getUserWallet.admin, { userId });

  const allTransactions = useMemo(() => {
    if (!transactions) return null;
    const combined = [...transactions.from, ...transactions.to];
    // Sort descending by creation time (most recent first)
    return combined.sort((a, b) => b._creationTime - a._creationTime);
  }, [transactions]);

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { if (!o) onClose() }}
      header={{
        title: 'Transactions',
        customBackIcon: 'x',
        showBackButton: true,
      }}
    >
      <View>
        {wallet && (
          <View style={{ padding: 8, marginBottom: 24, gap: 8 }}>
            <Text.H4 color={Colors.neutral[50]} style={{ marginBottom: 4 }}>Wallet Summary</Text.H4>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text.Base color={Colors.neutral[400]}>Balance:</Text.Base>
              <Text.Lg weight={600} color={Colors.primary[500]}>{wallet.credits} <Credits size={16} /></Text.Lg>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text.Base color={Colors.neutral[400]}>Streak:</Text.Base>
              <Text.Base color={Colors.neutral[50]} weight={600}>{wallet.streak.dailyClaimStreak} days</Text.Base>
            </View>
            {wallet.streak.previousBiggestStreak !== undefined && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text.Base color={Colors.neutral[400]}>Biggest Streak:</Text.Base>
                <Text.Base color={Colors.neutral[50]} weight={600}>{wallet.streak.previousBiggestStreak} days</Text.Base>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text.Base color={Colors.neutral[400]}>Next Claim:</Text.Base>
              <Text.Base color={Colors.neutral[50]} weight={600}>
                {wallet.canClaimNow ? 'Available Now' : new Date(wallet.nextClaimAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text.Base>
            </View>
          </View>
        )}
        {!allTransactions ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
            <Text.Base color={Colors.neutral[50]}>Loading...</Text.Base>
          </View>
        ) : allTransactions.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
            <Text.Base color={Colors.neutral[50]}>No transactions found.</Text.Base>
          </View>
        ) : (
          <View style={{ paddingBottom: 32, gap: 12 }}>
            {allTransactions.map(tx => {
              const isCredit = tx.toId === userId;
              let description: string = tx.type;

              if (tx.metadata?.reason) {
                description = tx.metadata.reason;
              } else if (tx.metadata?.claim) {
                description = `Streak Day ${tx.metadata.claim.streakDay}`;
              } else if (tx.metadata?.generationId) {
                description = `Generation (${tx.metadata.generationId.slice(0, 8)}...)`;
              }

              return (
                <Block
                  key={tx._id}
                  variant="blur"
                  style={{ padding: 14, borderRadius: 20 }}
                >
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text.Lg color={Colors.neutral[50]} weight={600} style={{ textTransform: 'capitalize' }}>
                        {tx.type.replace(/_/g, ' ').toLowerCase()}
                      </Text.Lg>
                      <Text.Lg weight={600} color={isCredit ? Colors.primary[500] : Colors.destructive[500]}>
                        {isCredit ? "+" : "-"}{tx.amount} <Credits size={14} />
                      </Text.Lg>
                    </View>
                    <Text.Sm style={{ marginBottom: 4, opacity: 0.6 }} color={Colors.neutral[400]}>
                      {new Date(tx._creationTime).toLocaleString()}
                    </Text.Sm>
                    <Text.Base color={Colors.neutral[50]} style={{ marginBottom: 8 }}>
                      {description}
                    </Text.Base>
                    <View
                      style={{ paddingTop: 8, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text.Sm style={{ opacity: 0.6 }} color={Colors.neutral[400]}>
                        Balance Before
                      </Text.Sm>
                      <Text.Base color={Colors.neutral[400]} weight={600}>
                        {tx.balanceAfter - (isCredit ? tx.amount : -tx.amount)}
                      </Text.Base>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text.Sm style={{ opacity: 0.6 }} color={Colors.neutral[400]}>
                        Balance After
                      </Text.Sm>
                      <Text.Base color={Colors.neutral[50]} weight={600}>
                        {tx.balanceAfter}
                      </Text.Base>
                    </View>
                  </View>
                </Block>
              );
            })}
          </View>
        )}
      </View>
    </Modal>
  )
}