// const ThemeProvider = dynamic(() => import("./theme").then((d) => d.ThemeProvider), { ssr: false })

import { FontsProvider } from "./fonts"

type Props = {
  children?: React.ReactNode
}

export const AsyncProviders = ({ children }: Props) => {
  return (
    <>
      {children}
      <FontsProvider />
      {/* <ThemeProvider /> */}
    </>
  )
}