import { ArrowLeft, ArrowRight, Home, X } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { router } from "expo-router";
import { atom, useAtom } from "jotai";
import { createContext, useContext, useRef, useState } from "react";
import { View } from "react-native";
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ROUTES } from "routes";
import { Colors } from "theme";

// Types for extracted product data
export type BrowserProductData = {
  title: string;
  description: string;
  images: { url: string; width: number; height: number }[];
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
  
  // Helper function to modify image URLs to get full-size versions
  function getFullSizeImageUrl(url) {
    if (!url) return url;
    
    // Replace width/imwidth parameters with 1024
    let modifiedUrl = url;
    
    // Handle imwidth?= or width?= patterns
    modifiedUrl = modifiedUrl.replace(/imwidth\?=[^&]*/g, 'imwidth?=1024');
    modifiedUrl = modifiedUrl.replace(/width\?=[^&]*/g, 'width?=1024');
    
    // Also handle &width= and &imwidth= patterns
    modifiedUrl = modifiedUrl.replace(/[&?]imwidth=[^&]*/g, '&imwidth=1024');
    modifiedUrl = modifiedUrl.replace(/[&?]width=[^&]*/g, '&width=1024');
    
    return modifiedUrl;
  }
  
  // Extract images (prioritize larger, product-related images)
  function getImages() {
    const metaImages = [];
    const productImages = [];
    const regularImages = [];
    
    // First priority: Open Graph image
    const ogImage = getMetaContent('og:image');
    if (ogImage) {
      metaImages.push({
        url: getFullSizeImageUrl(ogImage),
        width: 1200,
        height: 630
      });
    }
    
    // Second priority: Twitter image
    const twitterImage = getMetaContent('twitter:image');
    const twitterImageUrl = getFullSizeImageUrl(twitterImage);
    if (twitterImage && !metaImages.find(i => i.url === twitterImageUrl)) {
      metaImages.push({
        url: twitterImageUrl,
        width: 1200,
        height: 675
      });
    }
    
    // Third priority: Look for product images or large images in the page
    // Store images with their dimensions for sorting
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(img => {
      const src = getFullSizeImageUrl(img.src);
      const alt = img.alt || '';
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      
      // Filter out small images (likely icons/logos) and already included meta images
      if (src && width > 300 && height > 300 && !metaImages.find(i => i.url === src)) {
        const imageData = { url: src, width, height, size: width * height };
        
        // Separate images with product-related keywords
        const isProductImage = alt.toLowerCase().includes('product') ||
                               src.toLowerCase().includes('product') ||
                               img.className.toLowerCase().includes('product');
        
        if (isProductImage && !productImages.find(i => i.url === src)) {
          productImages.push(imageData);
        } else if (!regularImages.find(i => i.url === src)) {
          regularImages.push(imageData);
        }
      }
    });
    
    // Sort by size (largest first) within each category
    productImages.sort((a, b) => b.size - a.size);
    regularImages.sort((a, b) => b.size - a.size);
    
    // Combine in priority order: product images, regular images, meta images
    const allImages = [
      ...productImages.map(i => ({ url: i.url, width: i.width, height: i.height })),
      ...regularImages.map(i => ({ url: i.url, width: i.width, height: i.height })),
      ...metaImages,
    ];
    
    // Return unique images by URL, limit to top 10
    const uniqueImages = [];
    const seenUrls = new Set();
    for (const img of allImages) {
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push(img);
        if (uniqueImages.length >= 20) break;
      }
    }
    return uniqueImages;
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

interface BrowserProps {
  onTouchStart?: () => void;
  onProductExtracted: (data: BrowserProductData) => void;
  extractProductRef: React.RefObject<() => void>;
  goBackRef?: React.RefObject<() => void>;
  goForwardRef?: React.RefObject<() => void>;
  children?: React.ReactNode;
  onRouteChange?: (url: string) => void;
  /** Deactivated by default */
  autoExtractDelay?: number; // Optional delay in milliseconds before auto-extracting product info
}

// History
const BASE_URL = 'https://www.google.com';
const latestUrlAtom = atom<string>(BASE_URL);

export const Browser = ({ onProductExtracted, extractProductRef, goBackRef, goForwardRef, children, onRouteChange, onTouchStart, autoExtractDelay }: BrowserProps) => {
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useAtom(latestUrlAtom);

  let timer = useRef<number | null>(null);

  const goBack = () => { if (canGoBack) webviewRef.current?.goBack(); };
  const goForward = () => { if (canGoForward) webviewRef.current?.goForward(); };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as BrowserProductData;
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
      <View
        onTouchStart={onTouchStart}
        style={{
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

            if (autoExtractDelay) {
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => { extractProductInfo() }, autoExtractDelay);
            }
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

Browser.BaseUrl = BASE_URL;

type BrowserContextType = {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
}

const BrowserProvider = createContext<BrowserContextType | null>(null);
const BrowserProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const [currentUrl, setCurrentUrl] = useAtom(latestUrlAtom);

  return (
    <BrowserProvider.Provider value={{ currentUrl, setCurrentUrl }}>
      {children}
    </BrowserProvider.Provider>
  )
}

Browser.Provider = BrowserProviderComponent;

Browser.useContext = () => {
  const context = useContext(BrowserProvider);
  if (!context) throw new Error("Browser context is required");
  return context;
}