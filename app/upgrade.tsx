import { presentPaywall } from "@/lib/revenue-cat"
import { LogoLoading } from "@ui/icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { View } from "react-native"
import { Colors } from "theme"

const LoadingView = () => {
  const [init, setInit] = useState(false);
  useEffect(() => { setTimeout(() => setInit(true), 500) }, [])
  return (<View style={{
    backgroundColor: Colors.background,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    inset: 0,
    flex: 1,
  }}>
    {init && <LogoLoading size={120} />}
  </View>)
}

export default function Screen() {
  useEffect(() => {
    presentPaywall().finally(() => {
      if (router.canGoBack()) router.back();
      else router.dismissTo('/');
    })
  }, [])

  return <View style={{
    flex: 1,
    backgroundColor: Colors.background,
  }}>
    <LoadingView />
  </View>
}