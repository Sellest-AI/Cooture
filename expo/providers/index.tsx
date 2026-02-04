import { KeyboardAvoiderProvider } from '@good-react-native/keyboard-avoider'
import { AsyncProviders } from "./async"
import { ConvexClientProvider } from "./convex-client"
import { I18nProvider } from "./i18n"
import { MotionProvider } from "./motion"
import { ThemeProvider } from "./theme"

type Props = {
  children?: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
  return (
    <ConvexClientProvider>
      <I18nProvider>
        <ThemeProvider>
          <MotionProvider>
            <KeyboardAvoiderProvider>
              <AsyncProviders>
                {children}
              </AsyncProviders>
            </KeyboardAvoiderProvider>
          </MotionProvider>
        </ThemeProvider>
      </I18nProvider>
    </ConvexClientProvider>
  )
}