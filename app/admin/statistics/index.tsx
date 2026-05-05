import { api, useQuery } from "@/lib/convex/client";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Check, X } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Tabs } from "@ui/tabs";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Colors } from "theme";

type TimeRange = {
  durationMs?: number;
  label: string;
}

const TIME_RANGES: TimeRange[] = [
  { durationMs: undefined, label: "All Time" },
  { durationMs: 30 * 24 * 60 * 60 * 1000, label: "Month" },
  { durationMs: 7 * 24 * 60 * 60 * 1000, label: "Week" },
  { durationMs: 24 * 60 * 60 * 1000, label: "Today" },
];

export default function StatisticsScreen() {
  const [selectedRange, setSelectedRange] = useState<number>(2); // Default to 7 days
  const currentRange = TIME_RANGES[selectedRange];
  const { data: stats, isPending } = useQuery(api.router.admin.statistics.getAll.admin, {
    durationMs: currentRange.durationMs,
  });

  // Handle loading state
  if (isPending || !stats) {
    return (
      <SafeAreaView
        style={{
          paddingTop: Platform.OS !== 'ios' ? 12 : 0,
          paddingHorizontal: 12,
          paddingBottom: TOTAL_TABS_SPACE,
          flex: 1,
        }}
        edges={{ bottom: 'android' }}
      >
        <ModalHeader
          title="Statistics"
          onBack={router.canGoBack() ? router.back : undefined}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if ("error" in stats) {
    return (
      <SafeScrollView
        contentContainerStyle={{
          paddingTop: Platform.OS !== 'ios' ? 12 : 0,
          paddingHorizontal: 12,
          paddingBottom: TOTAL_TABS_SPACE
        }}
        edges={{ bottom: 'android' }}
      >
        <ModalHeader
          title="Statistics"
          onBack={router.canGoBack() ? router.back : undefined}
        />

        {/* Time Range Selector */}
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
          {TIME_RANGES.map((range, index) => (
            <Text.Base
              key={range.label}
              onPress={() => setSelectedRange(index)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: selectedRange === index ? '#007AFF' : '#E5E5EA',
                color: selectedRange === index ? 'white' : 'black',
              }}
            >
              {range.label}
            </Text.Base>
          ))}
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text.Base style={{ textAlign: "center", color: 'red' }}>{stats.error}</Text.Base>
        </View>
      </SafeScrollView>
    );
  }

  // TypeScript knows stats is a statistics object here
  const statsData = stats;
  const { users, content, engagement, aiUsage, snapshotAt, startAt, endAt } = statsData;

  return (
    <SafeScrollView
      contentContainerStyle={{
        paddingTop: Platform.OS !== 'ios' ? 12 : 0,
        paddingHorizontal: 12,
        paddingBottom: TOTAL_TABS_SPACE
      }}
      edges={{ bottom: 'android' }}
      stickyHeaderIndices={[1]}
    >
      <ModalHeader
        title="Statistics"
        onBack={router.canGoBack() ? router.back : undefined}
      />

      {/* Tabs */}
      <View style={{ marginBottom: 16, paddingTop: 8 }}>
        <Tabs
          activeTab={`${TIME_RANGES[selectedRange].durationMs}`}
          tabs={TIME_RANGES.map(r => ({ label: r.label, value: `${r.durationMs}` }))}
          onTabChange={(tab) => {
            const index = TIME_RANGES.findIndex(r => `${r.durationMs}` === tab);
            setSelectedRange(index);
          }}
        />
      </View>

      {/* Content Stats */}
      <View style={{ marginBottom: 20, marginTop: 16 }}>
        <Text.H3 color={Colors.neutral[50]}>Content</Text.H3>
        <Block style={{ padding: 12, marginTop: 12 }} variant="blur">
          <Text.Lg style={{ marginBottom: 4 }} color={Colors.neutral[400]}>Items</Text.Lg>
          <StatRow label="Total" value={content.items.total} indent />
          <StatRow label="New" value={content.items.new} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>Outfits</Text.Lg>
          <StatRow label="Total" value={content.outfits.total} indent />
          <StatRow label="New" value={content.outfits.new} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>Generations</Text.Lg>
          <StatRow label="Total" value={content.generations.total} indent />
          <StatRow label="New" value={content.generations.new} indent />
          <StatRow label="Completed" value={content.generations.completed} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>Videos</Text.Lg>
          <StatRow label="Total" value={content.videos.total} indent />
          <StatRow label="New" value={content.videos.new} indent />
        </Block>
      </View>

      {/* User Stats */}
      <View style={{ marginBottom: 20, marginTop: 16 }}>
        <Text.H3 color={Colors.neutral[50]}>Users</Text.H3>
        <Block style={{ padding: 12, marginTop: 12 }} variant="blur">
          <StatRow label="Total Users" value={users.total} />
          <StatRow label="New Registrations" value={users.newRegistrations} />
          <StatRow label="Active" value={users.active} />
          <StatRow label="With Subscriptions" value={users.withSubscriptions} />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>By Role</Text.Lg>
          <StatRow label="Admin" value={users.byRole.admin} indent />
          <StatRow label="User" value={users.byRole.user} indent />
          <StatRow label="Guest" value={users.byRole.guest} indent />
          <StatRow label="Bot" value={users.byRole.bot} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>By Status</Text.Lg>
          <StatRow label="Active" value={users.byStatus.active} indent />
          <StatRow label="Inactive" value={users.byStatus.inactive} indent />
          <StatRow label="Flagged" value={users.byStatus.flagged} indent />
          <StatRow label="Suspended" value={users.byStatus.suspended} indent />
        </Block>
      </View>

      {/* Engagement Stats */}
      <View style={{ marginBottom: 20, marginTop: 16 }}>
        <Text.H3 color={Colors.neutral[50]}>Engagement</Text.H3>
        <Block style={{ padding: 12, marginTop: 12 }} variant="blur">
          <Text.Lg style={{ marginBottom: 4 }} color={Colors.neutral[400]}>Likes</Text.Lg>
          <StatRow label="Total" value={engagement.likes.total} indent />
          <StatRow label="New" value={engagement.likes.new} indent />
          <StatRow label="Generations" value={engagement.likes.byType.generation} indent />
          <StatRow label="Outfits" value={engagement.likes.byType.outfit} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>Follows</Text.Lg>
          <StatRow label="Total" value={engagement.follows.total} indent />
          <StatRow label="New" value={engagement.follows.new} indent />

          <Text.Lg style={{ marginTop: 16, marginBottom: 4 }} color={Colors.neutral[400]}>Bookmarks</Text.Lg>
          <StatRow label="Total" value={engagement.bookmarks.total} indent />
          <StatRow label="New" value={engagement.bookmarks.new} indent />
        </Block>
      </View>

      {/* AI Usage Stats */}
      <View style={{ marginBottom: 20, marginTop: 16 }}>
        <Text.H3 color={Colors.neutral[50]}>AI Usage</Text.H3>
        <Block style={{ padding: 12, marginTop: 12 }} variant="blur">
          <Text.Lg style={{ marginBottom: 4 }} color={Colors.neutral[400]}>Generations</Text.Lg>
          <StatRow label="Total" value={aiUsage.generations.total} indent />
          <StatRow label="Completed" value={aiUsage.generations.completed} indent />
          <StatRow label="Accepted" value={aiUsage.generations.accepted} indent />
          <StatRow label="Rejected" value={aiUsage.generations.rejected} indent />
          <StatRow label="Failed" value={aiUsage.generations.failed} indent />
          <StatRow label="In Review" value={aiUsage.generations.inReview} indent />

          {/* <StatRow label="Tokens Used" value={aiUsage.tokensUsed} />
          <StatRow label="Credits Used" value={aiUsage.creditsUsed} /> */}
        </Block>
      </View>

      <Block
        variant="blur"
        style={{
          marginTop: 0,
          marginBottom: 16,
          gap: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          overflow: 'hidden',
          backgroundColor: Colors.blur.dark,
          height: 48,
          borderRadius: 20,
        }}>
        <X color={Colors.neutral[400]} size={24} />
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          overflow: 'hidden'
        }}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View
              style={{
                height: '100%',
                width: `${(aiUsage.generations.rejected / aiUsage.generations.completed) * 120}%`,
                backgroundColor: Colors.neutral[400],
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
              }}
            />
          </View>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <View
              style={{
                height: '100%',
                width: `${(aiUsage.generations.accepted / aiUsage.generations.completed) * 120}%`,
                backgroundColor: Colors.primary[500],
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }}
            />
          </View>
        </View>
        <Check color={Colors.primary[500]} size={24} />
      </Block>
      <Text.Sm style={{ color: Colors.neutral[400], textAlign: 'center' }}>
        {`Acceptance Rate: ${aiUsage.generations.completed > 0 ? ((aiUsage.generations.accepted / aiUsage.generations.completed) * 100).toFixed(2) : 'N/A'}%`}
      </Text.Sm>

      <Block
        variant="blur"
        style={{
          marginTop: 16,
          marginBottom: 16,
          gap: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          overflow: 'hidden',
          backgroundColor: Colors.blur.dark,
          height: 48,
          borderRadius: 20,
        }}>
        <X color={Colors.destructive[500]} size={24} />
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          overflow: 'hidden'
        }}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View
              style={{
                height: '100%',
                width: `${(aiUsage.generations.failed / aiUsage.generations.completed) * 100}%`,
                backgroundColor: Colors.destructive[500],
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
              }}
            />
          </View>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <View
              style={{
                height: '100%',
                width: `${(aiUsage.generations.completed / aiUsage.generations.completed) * 100}%`,
                backgroundColor: Colors.primary[500],
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }}
            />
          </View>
        </View>
        <Check color={Colors.primary[500]} size={24} />
      </Block>
      <Text.Sm style={{ color: Colors.neutral[400], textAlign: 'center' }}>
        {`Failure Rate: ${aiUsage.generations.completed > 0 ? ((aiUsage.generations.failed / aiUsage.generations.completed) * 100).toFixed(2) : 'N/A'}%`}
      </Text.Sm>

      {/* Time Range & Snapshot */}
      <Text.Sm style={{ color: Colors.neutral[400], textAlign: 'center', marginTop: 28 }}>
        {startAt ? `From: ${new Date(startAt).toLocaleDateString()}` : 'From: Beginning of time'} - {`To: ${new Date(endAt).toLocaleDateString()}`}
      </Text.Sm>
      <Text.Sm style={{ color: Colors.neutral[400], textAlign: 'center' }}>
        Last updated: {new Date(snapshotAt).toLocaleString()}
      </Text.Sm>
    </SafeScrollView>
  );
}

function StatRow({ label, value, indent }: { label: string; value: number; indent?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      paddingLeft: indent ? 12 : 0,
    }}>
      <Text.Base color={Colors.neutral[200]}>{label}</Text.Base>
      <Text.Base style={{ fontWeight: '500' }} color={Colors.neutral[50]}>{value.toLocaleString()}</Text.Base>
    </View>
  );
}