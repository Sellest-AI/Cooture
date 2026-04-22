import * as Linking from 'expo-linking';
import { Platform } from "react-native";
import Purchases from "react-native-purchases";

type Args = {
  onlyIfEntitlementIsActive?: boolean;
}
export const presentManager = async (args?: Args) => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active["Cooture Plus"];

    if (!entitlement) return false;

    if (args?.onlyIfEntitlementIsActive && !entitlement.isActive)
      return false;

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
  } catch (e) {
    console.warn("Failed to check subscription status before presenting paywall", e);
  }

  return false;
}

export const presentManagerIfNeeded = async () => {
  return presentManager({ onlyIfEntitlementIsActive: true });
}
