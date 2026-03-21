import { Href, Redirect, usePathname } from "expo-router";

export default function Screen() {
  const path = usePathname();
  return <Redirect href={`${path}/generations` as Href} />
}