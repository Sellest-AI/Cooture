import { Redirect, useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id, ...restParams } = useLocalSearchParams();

  if (!id) return <Redirect href="/" />

  return (
    <Redirect
      href={{
        pathname: "/item/[id]",
        params: { id: id.toString(), ...restParams },
      }}
    />
  );
}