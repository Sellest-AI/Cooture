import { KeyboardAvoiderProvider } from '@good-react-native/keyboard-avoider'
import { SafeAreaProvider } from '@ui/safe-area-view'
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
            <SafeAreaProvider>
              <KeyboardAvoiderProvider>
                <AsyncProviders>
                  {children}
                </AsyncProviders>
              </KeyboardAvoiderProvider>
            </SafeAreaProvider>
          </MotionProvider>
        </ThemeProvider>
      </I18nProvider>
    </ConvexClientProvider>
  )
}