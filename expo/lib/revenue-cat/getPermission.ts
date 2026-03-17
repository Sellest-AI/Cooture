import Purchases from 'react-native-purchases';

export const getPermission = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    if (typeof customerInfo.entitlements.active['Cooture Plus'] !== "undefined") {
      // Grant user access to entitlement
      return true;
    }

    return false;

  } catch {
    // Error fetching customer info
    return false;
  }
}