import { ROUTES, useRouter } from "@/hooks";
import { api, usePaginatedQuery } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Loader, LogoLoading } from "@ui/icons";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { replace } = useRouter();
  const [date] = useState((new Date()).getTime());
  const { results: generations } = usePaginatedQuery(api.router.generations.getPaginated.authed, {}, { initialNumItems: 4 });

  useEffect(() => {
    // Find the lastest generation that is still loading
    // And that was created either less than 5s ago, or more recent than the current screen load (to avoid picking an old generation that is still loading)
    const latestLoading = generations.find((g) => g.status !== 'COMPLETED'
      && (g._creationTime > date - 5000));

    if (latestLoading) {
      replace(ROUTES.PHOTOSHOOT.GENERATIONS.PATH, {
        pathParams: { id: latestLoading._id }
      })
    }
  }, [date, generations, replace])


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        overflow: 'hidden',
      }}
    >
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>
        <LogoLoading size={86} />
      </View>
      <SafeAreaView style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 32,
        maxWidth: 320,
        marginHorizontal: 'auto',
      }}
      >
        <Block
          variant="blur"
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 12,
            paddingHorizontal: 24,
            borderRadius: 99,
            gap: 12
          }}
        >
          <Loader color={Colors.primary[500]} />
          <Text.Base color={Colors.neutral[50]}>
            In queue...
          </Text.Base>
        </Block>
      </SafeAreaView>
    </View>
  )
}