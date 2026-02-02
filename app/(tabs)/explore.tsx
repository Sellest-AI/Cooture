import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Col, Grid, Row } from "@ui/grid";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { Pressable, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const GAP = 4;
const HEIGHT = 320;

const GridSkeleton = () => {
  return (
    <View style={{ paddingHorizontal: 4, gap: GAP }}>
      <Grid style={{ height: HEIGHT, gap: GAP }}>
        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
        </Col>
        <Col size={2}>
          <Skeleton style={{ flex: 1 }} />
        </Col>
      </Grid>
      <Grid style={{ height: HEIGHT, gap: GAP }}>
        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
        </Col>
        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
        </Col>
        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
        </Col>
      </Grid>
      <Grid style={{ height: HEIGHT, gap: GAP }}>
        <Col size={2}>
          <Skeleton style={{ flex: 1 }} />
        </Col>
        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
          <Row><Skeleton style={{ flex: 1 }} /></Row>
        </Col>
      </Grid>
    </View>
  )
}

const Post = ({ id, style }: { id: Id<'predictions'>, style?: ViewStyle }) => {
  const { data: post } = useQuery(api.router.post.getOne.anon, { id });
  if (!post) return <Skeleton style={style} />;

  return (
    <Pressable style={{ borderRadius: 16, overflow: 'hidden', flex: 1, ...style }}
      onPress={() => router.push(ROUTES.POST.ID(post._id))}
    >
      <Image
        style={{ flex: 1 }}
        source={{ uri: post.image?.sizes.medium.url }}
      />
    </Pressable>
  )
}

export default function Screen() {
  const { data: feed } = useQuery(api.router.post.getFeed.anon);

  const empty = (feed ?? []).length === 0;
  const Component = empty ? View : SafeScrollView;

  return (
    <Component
      style={{ flex: empty ? 1 : undefined }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: TOTAL_TABS_SPACE
      }}
    // stickyHeaderIndices={[0]}
    >
      <ModalHeader
        title="Discover"
        type="alt"
        size="big"
        endContent={<Notification />}
        style={{
          paddingTop: 12,
          paddingHorizontal: 20,
          backgroundColor: Colors.background,
        }}
      />
      <View>
        <PremiumBlock
          style={{ marginBottom: 20, marginHorizontal: 12 }}
        />
        {empty && <GridSkeleton />}
        {!empty && feed && (
          <View style={{ paddingHorizontal: 4, gap: GAP }}>
            {Array.from({ length: Math.ceil(feed.length / 12) }).map((_, cycleIndex) => {
              const startIdx = cycleIndex * 12;
              const posts = feed.slice(startIdx, startIdx + 12);

              return (
                <View key={cycleIndex} style={{ gap: GAP }}>
                  {/* First grid: 2 small left, 1 large right */}
                  {posts.length > 0 && (
                    <Grid style={{ height: HEIGHT, gap: GAP }}>
                      <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                        {posts[0] ? <Post id={posts[0]} style={{ flex: 1, borderTopLeftRadius: 8 }} /> : <Skeleton style={{ flex: 1 }} />}
                        {posts[1] ? <Post id={posts[1]} style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                      </Col>
                      <Col size={2}>
                        {posts[2] ? <Post id={posts[2]} style={{ flex: 1, borderTopRightRadius: 8 }} /> : <Skeleton style={{ flex: 1 }} />}
                      </Col>
                    </Grid>
                  )}

                  {/* Second grid: 3 columns of 2 small each */}
                  {posts.length > 3 && (
                    <Grid style={{ height: HEIGHT, gap: GAP }}>
                      <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                        {posts[3] ? <Row><Post id={posts[3]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        <Row>
                          {posts[4] ? <Post id={posts[4]} style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                        </Row>
                      </Col>
                      {posts.length > 5 && (
                        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                          {posts[5] ? <Row><Post id={posts[5]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                          {posts[6] ? <Row><Post id={posts[6]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        </Col>
                      )}
                      {posts.length > 7 && (
                        <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                          {posts[7] ? <Row><Post id={posts[7]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                          {posts[8] ? <Row><Post id={posts[8]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        </Col>
                      )}
                    </Grid>
                  )}

                  {/* Third grid: 1 large left, 2 small right */}
                  {posts.length > 9 && (
                    <Grid style={{ height: HEIGHT, gap: GAP }}>
                      <Col size={2}>
                        {posts[9] ? <Post id={posts[9]} style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                      </Col>
                      <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                        {posts[10] ? <Row><Post id={posts[10]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        {posts[11] ? <Row><Post id={posts[11]} style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                      </Col>
                    </Grid>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
      <Text.Base color={Colors.neutral[400]} style={{ textAlign: 'center', marginTop: 32, maxWidth: 200, alignSelf: 'center' }}>
        You have reached the end of the discover feed.
      </Text.Base>
    </Component>
  );
}