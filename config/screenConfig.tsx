import { Stack } from "expo-router";

export const screenConfigs = [
  { name: "index", options: {} },
  { name: "screens/Splash/index", options: {} },
  { name: "screens/Auth/Login/Login", options: {} },
  { name: "screens/Auth/Register", options: {} },
  { name: "(tabs)", options: { headerShown: false } },
  { name: "screens/CreatePost/index", options: { headerShown: false } },
  { name: "screens/EditProfileScreen/index", options: { headerShown: false } },
  { name: "screens/PostDetailScreen/index", options: { headerShown: false } },
  { name: "screens/UserProfileScreen/index", options: { headerShown: false } },
  { name: "screens/LeaderboardScreen/index", options: { headerShown: false } },
  { name: "screens/ExplorerScreen/index", options: { headerShown: false } },
  { name: "screens/ExplorerScreen/FilterModal", options: { headerShown: false } },
  { name: "screens/ExplorerScreen/MarkerBottomSheet", options: { headerShown: false } },
  { name: "screens/PostDetailScreen/CommentsModal", options: { headerShown: false } },
  { name: "screens/PostDetailScreen/RepliesModal", options: { headerShown: false } },
];

export function renderScreens() {
  return screenConfigs.map((screen) => (
    <Stack.Screen 
      key={screen.name} 
      name={screen.name} 
      options={screen.options} 
    />
  ));
} 