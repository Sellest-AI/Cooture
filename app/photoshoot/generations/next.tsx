import { ROUTES, useRouter } from "@/hooks";
import { api, usePaginatedQuery } from "@/lib/convex/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Roundish } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { replace } = useRouter();
  const [date] = useState((new Date()).getTime());
  const { results: generations } = usePaginatedQuery(api.router.generations.getPaginated.authed, {}, { initialNumItems: 4 });

  const { preset } = usePhotoshoot.New();

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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {preset && <Image
        source={preset?.cover?.url}
        blurRadius={30}
        style={{
          flex: 1,
          opacity: 0.1,
          position: 'absolute',
          inset: 0,
        }}
      />}
      <SafeAreaView style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <Roundish
          color={Colors.primary[500]}
          strokeColor={Colors.primary[700]}
          strokeWidth={2}
          animate={true}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        />
      </SafeAreaView>
    </View>
  )
}