import { Collection } from "@ui/cards";
import { MasonryList } from "@ui/masonry-list";
import { View } from "react-native";

export default function OutfitsScreen() {
  return (
    <MasonryList
      data={[
        require('assets/placeholders/jeans-outfit.png'),
        require('assets/placeholders/full-outfit.png'),
        require('assets/placeholders/shoes-outfit.png'),
        require('assets/placeholders/jeans-outfit.png'),
        require('assets/placeholders/full-outfit.png'),
        require('assets/placeholders/jeans-outfit.png'),
        require('assets/placeholders/full-outfit.png'),
        require('assets/placeholders/shoes-outfit.png'),
      ]}
      style={{ columnGap: 48, paddingHorizontal: 12 }}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 24, paddingTop: 3 }}>
          <Collection
            source={item as string}
            contentFit="contain"
            title="Outfit"
            subtitle="4 items"
          />
        </View>
      )}
      numColumns={2}
    />
  );
}
