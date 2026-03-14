import { api, Id } from "@/lib/convex/api";
import { useQuery, useQueryCached } from "@/lib/convex/client";
import { useFeed } from "@/modules/feed/_hooks";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { BlurKeys, BlurTargetView } from "@ui/blur-view";
import { FlashList } from "@ui/flat-list";
import { Col, Grid, Row } from "@ui/grid";
import { Loader, Search } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { Pressable as AnimatedPressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { Pressable, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const GAP = 4;
const HEIGHT = 332;

const GridSkeleton = () => {
  return (
    <View style={{ gap: GAP }}>
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

const Generation = ({ id, style, size = 'large' }: { id: Id<'generations'>, style?: ViewStyle, size?: 'small' | 'large' }) => {
  const { data: post } = useQuery(api.router.generations.getOne.anon, { id });
  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, post?.predictions[0]?.imageId ? { id: post?.predictions[0]?.imageId } : 'skip');

  if (!post || !image) return <Skeleton style={style} />;

  const finalSize = size === 'large' ? 'medium' : 'small';

  return (
    <Pressable style={{ borderRadius: 16, overflow: 'hidden', flex: 1, ...style }}
      onPress={() => router.push(ROUTES.POST.ID(post.predictions[0]._id))}
    >
      <Image
        style={{ flex: 1 }}
        source={{ uri: image?.sizes[finalSize].url }}
      />
    </Pressable>
  )
}

const Outfit = ({ id, style, size = 'large' }: { id: Id<'outfits'>, style?: ViewStyle, size: 'small' | 'large' }) => {
  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, { outfitId: id });
  if (!outfit) return <Skeleton style={style} />;

  const image = outfit.cover ?? outfit.items[0].image;

  const finalSize = size === 'large' ? 'medium' : 'small';

  return (
    <Pressable style={{ borderRadius: 16, overflow: 'hidden', flex: 1, ...style }}
      onPress={() => router.push(ROUTES.OUTFIT.ID(outfit._id))}
    >
      <Image
        style={{ flex: 1, backgroundColor: outfit.backgroundColor }}
        source={{ uri: image.sizes[finalSize].url }}
      />
    </Pressable>
  )
}

type PostProps = { style?: ViewStyle, size?: 'small' | 'large' } & ({ id: Id<'generations'> | Id<'outfits'>, type: 'generation' | 'outfit' });
const Post = ({ id, type, style, size = 'large' }: PostProps) => {
  if (type === 'generation') {
    return <Generation id={id as Id<'generations'>} style={style} size={size} />;
  }

  return <Outfit id={id as Id<'outfits'>} style={style} size={size} />;
}

export default function Screen() {
  const { feed, canLoadMore, loadMore, updateSeed } = useFeed({ initialNumItems: 16 });

  const empty = (feed ?? []).length === 0;

  return (
    <BlurTargetView blurKey={BlurKeys.EXPLORE}>
      <SafeAreaView edges={{ top: 'additive', bottom: 'maximum' }}>
        <FlashList
          onEndReached={() => loadMore(24)}
          onRefresh={() => updateSeed()}
          style={{ flex: empty ? 1 : undefined }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TOTAL_TABS_SPACE,
            paddingHorizontal: 4,
          }}
          ListHeaderComponent={
            <ModalHeader
              title="Discover"
              type="alt"
              size="big"
              endContent={
                <AnimatedPressable onPress={() => router.push(ROUTES.SEARCH)}>
                  <Block
                    variant="blur"
                    style={{
                      borderRadius: 99,
                      padding: 10,
                    }}
                  >
                    <Search size={24} color={Colors.foreground} />
                  </Block>
                </AnimatedPressable>
              }
              style={{
                paddingTop: 12,
                paddingLeft: 16,
                paddingRight: 12,
                backgroundColor: Colors.background,
              }}
            />
          }
          ListEmptyComponent={<GridSkeleton />}
          ListFooterComponent={<>
            {canLoadMore && <View style={{ marginTop: 32, marginBottom: 48, alignItems: 'center' }}>
              <View style={{ position: 'absolute' }}><Loader color={Colors.foreground} /></View>
            </View>}
            {!canLoadMore && <Text.Base
              style={{ textAlign: 'center', marginTop: 32, maxWidth: 200, alignSelf: 'center' }}
              color={Colors.neutral[400]}
            >
              You have reached the end of the discover feed.
            </Text.Base>}
          </>}
          data={empty ? undefined : Array.from({ length: Math.ceil(feed.length / 12) }).map((_, index) => {
            const startIdx = index * 12;
            return feed.slice(startIdx, startIdx + 12);
          })}
          extraData={feed}
          keyExtractor={(chunk, index) => {
            return chunk.length > 0 ? chunk.map(p => p._id).join('-') : `empty-${index}`;
          }}
          renderItem={({ item, index }) => {
            const cycleIndex = index;
            const posts = item;
            return (
              <View key={cycleIndex} style={{ gap: GAP, marginBottom: 4 }}>
                {/* First grid: 2 small left, 1 large right */}
                {posts.length > 0 && (
                  <Grid style={{ height: HEIGHT, gap: GAP }}>
                    <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                      {posts[1] ? <Post id={posts[1]._id} type={posts[1].type} size="small" style={{ flex: 1, borderTopLeftRadius: 8 }} /> : <Skeleton style={{ flex: 1 }} />}
                      {posts[2] ? <Post id={posts[2]._id} type={posts[2].type} size="small" style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                    </Col>
                    <Col size={2}>
                      {posts[0] ? <Post id={posts[0]._id} type={posts[0].type} size="large" style={{ flex: 1, borderTopRightRadius: 8 }} /> : <Skeleton style={{ flex: 1 }} />}
                    </Col>
                  </Grid>
                )}

                {/* Second grid: 3 columns of 2 small each */}
                {posts.length > 3 && (
                  <Grid style={{ height: HEIGHT, gap: GAP }}>
                    <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                      {posts[3] ? <Row><Post id={posts[3]._id} type={posts[3].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                      <Row>
                        {posts[4] ? <Post id={posts[4]._id} type={posts[4].type} size="small" style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                      </Row>
                    </Col>
                    {posts.length > 5 && (
                      <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                        {posts[5] ? <Row><Post id={posts[5]._id} type={posts[5].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        {posts[6] ? <Row><Post id={posts[6]._id} type={posts[6].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                      </Col>
                    )}
                    {posts.length > 7 && (
                      <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                        {posts[7] ? <Row><Post id={posts[7]._id} type={posts[7].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                        {posts[8] ? <Row><Post id={posts[8]._id} type={posts[8].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                      </Col>
                    )}
                  </Grid>
                )}

                {/* Third grid: 1 large left, 2 small right */}
                {posts.length > 9 && (
                  <Grid style={{ height: HEIGHT, gap: GAP }}>
                    <Col size={2}>
                      {posts[9] ? <Post id={posts[9]._id} type={posts[9].type} size="large" style={{ flex: 1 }} /> : <Skeleton style={{ flex: 1 }} />}
                    </Col>
                    <Col style={{ height: HEIGHT, gap: GAP }} size={1}>
                      {posts[10] ? <Row><Post id={posts[10]._id} type={posts[10].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                      {posts[11] ? <Row><Post id={posts[11]._id} type={posts[11].type} size="small" style={{ flex: 1 }} /></Row> : <Row><Skeleton style={{ flex: 1 }} /></Row>}
                    </Col>
                  </Grid>
                )}
              </View>
            );
          }}
        />
      </SafeAreaView>
    </BlurTargetView>
  );
}