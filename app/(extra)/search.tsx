import { useDebounce } from "@/hooks";
import { SearchDefaultScreen } from "@/modules/search/defaultScreen";
import { SearchResults } from "@/modules/search/searchResults";
import { Block } from "@ui/block";
import { ArrowLeft, Loader, Search } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;

  const hasQuery = query.length > 0;

  return (
    <SafeAreaView
      edges={{ bottom: 'off' }}
      style={{ flex: 1 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 12,
        paddingTop: Platform.OS !== 'ios' ? 12 : 0,
      }}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : undefined}>
          <Block
            style={{ borderRadius: 99, padding: 10 }}
            variant="blur"
          >
            <ArrowLeft color={Colors.foreground} />
          </Block>
        </Pressable>
        <TextInput
          startIcon={isLoading ? Loader : Search}
          canClear
          autoFocus
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1 }}
        />
      </View>
      {hasQuery ? <SearchResults
        query={query}
        onLoadingChange={setIsLoading}
      /> :
        <SearchDefaultScreen />}
    </SafeAreaView>
  )
}
