import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold } from '@expo-google-fonts/mukta';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/js-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { color, type } from '../design/theme';
import { AuthProvider, useAuth } from '../lib/auth';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold });
  // Fall back to system fonts rather than block the app if fonts fail to load.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Routes />
    </AuthProvider>
  );
}

function Routes() {
  const { session, restoring } = useAuth();
  if (restoring) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  const signedIn = !!session;
  return (
    <Stack
      screenOptions={{
        headerTintColor: color.text.primary,
        headerStyle: { backgroundColor: color.bg.canvas },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: type.subheading.fontFamily, fontSize: type.subheading.fontSize },
        cardStyle: { backgroundColor: color.bg.canvas },
      }}
    >
      <Stack.Protected guard={signedIn} redirectTo="/welcome">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="return-check" options={{ title: 'Return check', presentation: 'modal' }} />
        <Stack.Screen name="styleguide" options={{ title: 'Style guide' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  );
}
