import { api, useQuery } from "@/lib/convex/client";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

type TimeRange = {
  startAt?: number;
  endAt: number;
  label: string;
}

const TIME_RANGES: TimeRange[] = [
  { startAt: undefined, endAt: Date.now(), label: "All Time" },
  { startAt: Date.now() - 30 * 24 * 60 * 60 * 1000, endAt: Date.now(), label: "30 Days" },
  { startAt: Date.now() - 7 * 24 * 60 * 60 * 1000, endAt: Date.now(), label: "7 Days" },
  { startAt: Date.now() - 24 * 60 * 60 * 1000, endAt: Date.now(), label: "24 Hours" },
];

export default function StatisticsScreen() {
  const [selectedRange, setSelectedRange] = useState<number>(2); // Default to 7 days
  const currentRange = TIME_RANGES[selectedRange];
  const { data: stats, isPending } = useQuery(api.router.admin.statistics.getAll.admin, {
    startAt: currentRange.startAt,
    endAt: currentRange.endAt,
  });

  // Handle loading state
  if (isPending || !stats) {
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeScrollView>
    );
  }

  // TypeScript knows stats is a statistics object here
  const statsData = stats as any;
  const { users, content, engagement, aiUsage, snapshotAt, startAt, endAt } = statsData;

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

      {/* User Stats */}
      <View style={{ marginBottom: 20 }}>
        <Text.H3>Users</Text.H3>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
          <StatRow label="Total Users" value={users.total} />
          <StatRow label="New Registrations" value={users.newRegistrations} />
          <StatRow label="Active" value={users.active} />
          <StatRow label="With Subscriptions" value={users.withSubscriptions} />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>By Role</Text.Lg>
          <StatRow label="Admin" value={users.byRole.admin} indent />
          <StatRow label="User" value={users.byRole.user} indent />
          <StatRow label="Guest" value={users.byRole.guest} indent />
          <StatRow label="Bot" value={users.byRole.bot} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>By Status</Text.Lg>
          <StatRow label="Active" value={users.byStatus.active} indent />
          <StatRow label="Inactive" value={users.byStatus.inactive} indent />
          <StatRow label="Flagged" value={users.byStatus.flagged} indent />
          <StatRow label="Suspended" value={users.byStatus.suspended} indent />
        </View>
      </View>

      {/* Content Stats */}
      <View style={{ marginBottom: 20 }}>
        <Text.H3>Content</Text.H3>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
          <Text.Lg style={{ marginBottom: 4 }}>Items</Text.Lg>
          <StatRow label="Total" value={content.items.total} indent />
          <StatRow label="New" value={content.items.new} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>Outfits</Text.Lg>
          <StatRow label="Total" value={content.outfits.total} indent />
          <StatRow label="New" value={content.outfits.new} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>Generations</Text.Lg>
          <StatRow label="Total" value={content.generations.total} indent />
          <StatRow label="New" value={content.generations.new} indent />
          <StatRow label="Completed" value={content.generations.completed} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>Videos</Text.Lg>
          <StatRow label="Total" value={content.videos.total} indent />
          <StatRow label="New" value={content.videos.new} indent />
        </View>
      </View>

      {/* Engagement Stats */}
      <View style={{ marginBottom: 20 }}>
        <Text.H3>Engagement</Text.H3>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
          <Text.Lg style={{ marginBottom: 4 }}>Likes</Text.Lg>
          <StatRow label="Total" value={engagement.likes.total} indent />
          <StatRow label="New" value={engagement.likes.new} indent />
          <StatRow label="Generations" value={engagement.likes.byType.generation} indent />
          <StatRow label="Outfits" value={engagement.likes.byType.outfit} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>Follows</Text.Lg>
          <StatRow label="Total" value={engagement.follows.total} indent />
          <StatRow label="New" value={engagement.follows.new} indent />

          <Text.Lg style={{ marginTop: 8, marginBottom: 4 }}>Bookmarks</Text.Lg>
          <StatRow label="Total" value={engagement.bookmarks.total} indent />
          <StatRow label="New" value={engagement.bookmarks.new} indent />
        </View>
      </View>

      {/* AI Usage Stats */}
      <View style={{ marginBottom: 20 }}>
        <Text.H3>AI Usage</Text.H3>
        <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 12 }}>
          <Text.Lg style={{ marginBottom: 4 }}>Generations</Text.Lg>
          <StatRow label="Total" value={aiUsage.generations.total} indent />
          <StatRow label="Completed" value={aiUsage.generations.completed} indent />
          <StatRow label="Failed" value={aiUsage.generations.failed} indent />
          <StatRow label="In Review" value={aiUsage.generations.inReview} indent />

          <StatRow label="Tokens Used" value={aiUsage.tokensUsed} />
          <StatRow label="Credits Used" value={aiUsage.creditsUsed} />
        </View>
      </View>

      {/* Time Range & Snapshot */}
      <Text.Sm style={{ color: '#8E8E93', textAlign: 'center', marginTop: 8 }}>
        {startAt ? `From: ${new Date(startAt).toLocaleDateString()}` : 'From: Beginning of time'} - {`To: ${new Date(endAt).toLocaleDateString()}`}
      </Text.Sm>
      <Text.Sm style={{ color: '#8E8E93', textAlign: 'center' }}>
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
      <Text.Base style={{ color: indent ? '#8E8E93' : '#000' }}>{label}</Text.Base>
      <Text.Base style={{ fontWeight: '500' }}>{value.toLocaleString()}</Text.Base>
    </View>
  );
}