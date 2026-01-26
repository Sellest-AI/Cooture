import { Redirect } from 'expo-router';
import { ROUTES } from 'routes';

export default function Screen() {
  return <Redirect href={ROUTES.PROFILE.OUTFITS} />;
}
