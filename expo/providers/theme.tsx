import { DarkTheme, DefaultTheme, ThemeProvider as NativeThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "@ui/hooks/use-color-scheme";
import React from "react";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();

  return (
    <NativeThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NativeThemeProvider>
  );
}