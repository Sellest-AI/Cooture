import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { presentManagerIfNeeded } from './presentManager';

export async function presentPaywallIfNeeded(): Promise<boolean> {
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

// Make sure to configure a Paywall in the Dashboard first.
export async function presentPaywall(): Promise<boolean> {
  await presentManagerIfNeeded();
  return await presentPaywallIfNeeded();
}