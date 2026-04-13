import { Linking, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const presentManagerIfNeeded = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    if (typeof customerInfo.entitlements.active["Cooture Plus"] !== "undefined") {
      try {
        if (Platform.OS === 'ios') {
          await Purchases.showManageSubscriptions();
          return true;
        } else if (customerInfo.managementURL) {
          await Linking.openURL(customerInfo.managementURL);
          return true;
        }
      } catch {
        if (customerInfo.managementURL) {
          await Linking.openURL(customerInfo.managementURL);
          return true;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to check subscription status before presenting paywall", e);
  }
}

// Make sure to configure a Paywall in the Dashboard first.
export async function presentPaywall(): Promise<boolean> {
  await presentManagerIfNeeded();

  // Present paywall for current offering:
  // const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

  const offerings = await Purchases.getOfferings();

  const offering = offerings.all['default'] ?? offerings.current;

  // Present paywall for current offering:
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    // offering: offering, // Optional Offering object obtained through getOfferings
    requiredEntitlementIdentifier: "Cooture Plus",
    displayCloseButton: true,
    offering,
  });

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}