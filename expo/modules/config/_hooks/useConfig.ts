import { api, useQueryCached } from "@/lib/convex/client";
import { nativeApplicationVersion } from 'expo-application';

// utils/compareVersions.ts
export const compareVersions = (a: string, b: string): number => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};


export const useConfig = () => {
  const { data: config, isPending } = useQueryCached(api.router.admin.config.getConfig.anon);

  const currentVersion = nativeApplicationVersion ?? '0.0.0';
  const requiredVersion = config?.minAppVersion ?? config?.appVersion ?? '999.999.999';
  const upcomingVersion = config?.upcomingAppVersion ?? '999.999.999';
  const isUpcomingVersion = compareVersions(currentVersion, upcomingVersion) >= 0;
  const isOutdated = compareVersions(currentVersion, requiredVersion) < 0;

  return {
    isPending,
    currentVersion,
    requiredVersion,
    upcomingVersion,
    isUpcomingVersion,
    isOutdated,
  }
}