// const ThemeProvider = dynamic(() => import("./theme").then((d) => d.ThemeProvider), { ssr: false })

type Props = {
  children?: React.ReactNode
}

export const AsyncProviders = ({ children }: Props) => {
  return (
    <>
      {children}
      {/* <ThemeProvider /> */}
    </>
  )
}