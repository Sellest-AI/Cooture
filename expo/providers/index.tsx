import { KeyboardAvoiderProvider } from '@good-react-native/keyboard-avoider'
import { BlurProvider } from '@ui/blur-view'
import { SafeAreaProvider } from '@ui/safe-area-view'
import { ToastsProvider } from '@ui/toast'
import { AsyncProviders } from "./async"
import { AuthProvider } from './auth'
import { ConvexClientProvider } from "./convex-client"
import { I18nProvider } from "./i18n"
import { MotionProvider } from "./motion"
import { PostHogProvider } from './posthog'
import { RevenueCatProvider } from './revenue-cat'
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
            <BlurProvider>
              <SafeAreaProvider>
                <KeyboardAvoiderProvider>
                  <AsyncProviders>
                    <AuthProvider>
                      <ToastsProvider>
                        <PostHogProvider>
                          <RevenueCatProvider>
                            {children}
                          </RevenueCatProvider>
                        </PostHogProvider>
                      </ToastsProvider>
                    </AuthProvider>
                  </AsyncProviders>
                </KeyboardAvoiderProvider>
              </SafeAreaProvider>
            </BlurProvider>
          </MotionProvider>
        </ThemeProvider>
      </I18nProvider>
    </ConvexClientProvider>
  )
}