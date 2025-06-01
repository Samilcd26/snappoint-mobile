import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect from the index page to the explorer page
  return <Redirect href="/(tabs)/explorer" />;
} 