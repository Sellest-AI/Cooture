import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowLeft, ArrowRight, Home, Plus, Search, TShirt, X } from "@ui/icons";
import { Image } from "@ui/image";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ROUTES } from "routes";
import { Colors } from "theme";

// Types for extracted product data
interface ProductData {
  title: string;
  description: string;
  images: string[];
  url: string;
}

// JavaScript code to extract product information from the current webpage
const EXTRACT_PRODUCT_INFO = `
(function() {
  // Helper function to get meta tag content
  function getMetaContent(name) {
    const meta = document.querySelector('meta[name="' + name + '"]') || 
                 document.querySelector('meta[property="' + name + '"]') ||
                 document.querySelector('meta[property="og:' + name + '"]');
    return meta ? meta.getAttribute('content') : '';
  }
  
  // Extract title from multiple sources
  function getTitle() {
    return getMetaContent('og:title') ||
           getMetaContent('twitter:title') ||
           document.querySelector('h1')?.innerText ||
           document.title ||
           'Untitled';
  }
  
  // Extract description
  function getDescription() {   
    // Search for elements with attributes containing description-related keywords
    const descriptionPatterns = [
      'product-description',
      'product_description',
      'productdescription',
      'description',
      'product-details',
      'product_details',
      'productdetails'
    ];
    
    // Search in common attributes (data-*, class, id)
    for (const pattern of descriptionPatterns) {
      // Try data-testid, data-id, data-cy, etc.
      const selectors = [
        '[data-testid*="' + pattern + '"]',
        '[data-test*="' + pattern + '"]',
        '[data-cy*="' + pattern + '"]',
        '[data-id*="' + pattern + '"]',
        '[class*="' + pattern + '"]',
        '[id*="' + pattern + '"]'
      ];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim().length > 80) {
            return element.textContent.trim();
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
    }

    // First try meta tags
    const metaDesc = getMetaContent('og:description') ||
                     getMetaContent('description') ||
                     getMetaContent('twitter:description') ||
                     document.querySelector('meta[name="description"]')?.content;
    
    if (metaDesc) return metaDesc;
    
    return '';
  }
  
  // Extract images (prioritize larger, product-related images)
  function getImages() {
    const metaImages = [];
    const productImages = [];
    const regularImages = [];
    
    // First priority: Open Graph image
    const ogImage = getMetaContent('og:image');
    if (ogImage) metaImages.push(ogImage);
    
    // Second priority: Twitter image
    const twitterImage = getMetaContent('twitter:image');
    if (twitterImage && !metaImages.includes(twitterImage)) {
      metaImages.push(twitterImage);
    }
    
    // Third priority: Look for product images or large images in the page
    // Store images with their dimensions for sorting
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(img => {
      const src = img.src;
      const alt = img.alt || '';
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      
      // Filter out small images (likely icons/logos) and already included meta images
      if (src && width > 300 && height > 300 && !metaImages.includes(src)) {
        const imageData = { src, width, height, size: width * height };
        
        // Separate images with product-related keywords
        const isProductImage = alt.toLowerCase().includes('product') ||
                               src.toLowerCase().includes('product') ||
                               img.className.toLowerCase().includes('product');
        
        if (isProductImage && !productImages.find(i => i.src === src)) {
          productImages.push(imageData);
        } else if (!regularImages.find(i => i.src === src)) {
          regularImages.push(imageData);
        }
      }
    });
    
    // Sort by size (largest first) within each category
    productImages.sort((a, b) => b.size - a.size);
    regularImages.sort((a, b) => b.size - a.size);
    
    // Combine in priority order: meta images, product images, regular images
    const allImages = [
      ...productImages.map(i => i.src),
      ...regularImages.map(i => i.src),
      ...metaImages,
    ];
    
    // Return unique images, limit to top 10
    return [...new Set(allImages)].slice(0, 10);
  }
  
  // Collect all data
  const productData = {
    title: getTitle(),
    description: getDescription(),
    images: getImages(),
    url: window.location.href
  };
  
  // Send data back to React Native
  window.ReactNativeWebView.postMessage(JSON.stringify(productData));
})();
true; // Required for iOS
`;

type RoundedButtonProps = {
  badgeCount?: number;
  style?: ViewStyle;
  icon?: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle }> | false;
  onPress?: () => void;
  variant?: "primary" | "blur" | "secondary";
}
const RoundedButton = ({ onPress, style, badgeCount, icon: Icon, variant = "blur" }: RoundedButtonProps) => {
  const { padding = 10, ...restStyle } = style || {};
  return (
    <Pressable style={restStyle} onPress={onPress}>
      <Block variant={variant} style={{
        borderRadius: 99,
        padding: padding,
      }}>
        {Icon && <Icon size={24} color={Colors.foreground} />}
      </Block>
      {(badgeCount && badgeCount > 0) ? <Block variant="destructive" style={styles.badge}>
        <Text.Sm color={Colors.destructive[50]} weight={700} style={{ marginLeft: -1, marginTop: -1 }}>
          {badgeCount}
        </Text.Sm>
      </Block> : undefined}
    </Pressable>
  )
}

const OutfitsButton = ({ style, items }: { style?: ViewStyle, items: number }) => {
  if (items === 0) return null;

  return (
    <MotiView
      from={{ width: 0, translateX: -52 }}
      animate={{ width: 56, translateX: 0 }}
      transition={{ delay: 100 }}
    >
      <RoundedButton
        style={{ padding: 14, ...style }}
        icon={TShirt}
        badgeCount={items}
      />
    </MotiView>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 2,
    right: -4,
    borderRadius: 99,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  }
})

interface BrowserProps {
  onProductExtracted: (data: ProductData) => void;
  extractProductRef: React.RefObject<() => void>;
  goBackRef?: React.RefObject<() => void>;
  goForwardRef?: React.RefObject<() => void>;
  children?: React.ReactNode;
  onRouteChange?: (url: string) => void;
}

const BASE_URL = 'https://www.google.com';

const Browser = ({ onProductExtracted, extractProductRef, goBackRef, goForwardRef, children, onRouteChange }: BrowserProps) => {
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(BASE_URL);

  let timer = useRef<number | null>(null);

  const goBack = () => { if (canGoBack) webviewRef.current?.goBack(); };
  const goForward = () => { if (canGoForward) webviewRef.current?.goForward(); };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as ProductData;
      onProductExtracted(data);
    } catch (e) {
      console.error("Failed to parse product data:", e);
    }
  };

  const extractProductInfo = () => {
    webviewRef.current?.injectJavaScript(EXTRACT_PRODUCT_INFO);
  }
  extractProductRef.current = extractProductInfo;

  if (goBackRef) goBackRef.current = goBack;
  if (goForwardRef) goForwardRef.current = goForward;

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flex: 1,
        marginHorizontal: 0,
        borderRadius: 12,
        borderTopEndRadius: 0,
        borderTopStartRadius: 0,
        overflow: 'hidden'
      }}>
        <WebView
          ref={webviewRef}
          style={{ flex: 1 }}
          source={{ uri: currentUrl }}
          onMessage={handleMessage}
          onNavigationStateChange={(navState) => {
            const url = navState.url.trim();
            setCanGoForward(navState.canGoForward);
            setCanGoBack(navState.canGoBack);
            setCurrentUrl(url);
            onRouteChange?.(url);

            console.log("TEST", url);

            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => { extractProductInfo() }, 500);
          }}
        />
      </View>
      {children}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 12
      }}>
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <Pressable onPress={goBack} disabled={!canGoBack} style={{ opacity: canGoBack ? 1 : 0.5 }}>
            <ArrowLeft color={Colors.foreground} size={24} />
          </Pressable>
          <Pressable onPress={goForward} disabled={!canGoForward} style={{ opacity: canGoForward ? 1 : 0.5 }}>
            <ArrowRight color={Colors.foreground} size={24} />
          </Pressable>
          <Pressable onPress={() => setCurrentUrl(BASE_URL)}>
            <Home color={Colors.foreground} size={24} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <X
            onPress={() => router.canGoBack() ? router.back() : router.dismissTo(ROUTES.TABS.NEW)}
            color={Colors.foreground}
            size={24}
          />
        </View>
      </View>
    </View>
  )
}

export default function Screen() {
  const [url, setUrl] = useState<string>(BASE_URL);
  const extractProductRef = useRef<() => void>(() => { });
  const [item, setItem] = useState<ProductData | null>(null);
  const [outfitItems, setOutfitItems] = useState<ProductData[]>([]);

  const handleProductExtracted = (data: ProductData) => {
    if (data.images.length === 0) return null;
    setItem(data);
  };

  const itemImage = item?.images?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Browser
          onProductExtracted={handleProductExtracted}
          extractProductRef={extractProductRef}
          onRouteChange={(url) => { setUrl(url); console.log(url.startsWith(BASE_URL)) }}
        >
          <AnimatePresence>
            {!url.startsWith(BASE_URL) && <MotiView
              from={{ opacity: 0, scale: 0.8, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 56 + 8 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, translateY: -24 }}
              exitTransition={{ delay: 0 }}
              transition={{ delay: 500 }}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '100%',
                gap: 8,
                paddingTop: 8,
                paddingHorizontal: 8,
              }}>
              <OutfitsButton items={outfitItems.length} />
              {!item && <Button
                variant="blur"
                startIcon={Search}
                onPress={async () => {
                  extractProductRef.current();
                }}
                style={{ flex: 1 }}
              >
                Extract item
              </Button>}
              {item && <Button
                variant="blur"
                startIcon={itemImage ? undefined : Plus}
                startContent={itemImage ? <Image
                  style={{ width: 24, height: 24, borderRadius: 8 }}
                  source={itemImage}
                  contentFit="cover"
                /> : undefined}
                onPress={async () => {
                  setOutfitItems([...outfitItems, item]);
                  setItem(null);
                }}
                style={{ flex: 1 }}
              >
                Add to outfit
              </Button>}
              {outfitItems.length > 0 && <Button
                size="rounded"
                variant="primary"
                startIcon={ArrowRight}
                style={{ padding: 6 }}
              />}
            </MotiView>}
          </AnimatePresence>
        </Browser>
      </View>
    </SafeAreaView>
  )
}