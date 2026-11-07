import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold } from '@expo-google-fonts/mukta';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/js-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { color, type } from '../design/theme';
import { AuthProvider, useAuth } from '../lib/auth';
import { PrototypeProvider } from '../proto/store';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold, Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold });
  // Fall back to system fonts rather than block the app if fonts fail to load.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  return (
    <AuthProvider>
      <PrototypeProvider>
        <StatusBar style="dark" />
        <Routes />
      </PrototypeProvider>
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
        <Stack.Screen name="prototype" options={{ title: 'All screens' }} />
        <Stack.Screen name="notifications" options={{ title: 'Alerts' }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Task' }} />
        <Stack.Screen name="missed/[id]" options={{ title: 'Missed check-in' }} />
        <Stack.Screen name="day-report" options={{ title: 'Day report' }} />
        <Stack.Screen name="emergency" options={{ title: 'Emergency' }} />
        <Stack.Screen name="wallet" options={{ title: 'Wallet and health' }} />
        <Stack.Screen name="code-card" options={{ title: 'Food-box code card' }} />
        <Stack.Screen name="pet-edit" options={{ title: 'Pet profile' }} />
        <Stack.Screen name="routine" options={{ title: 'Routine' }} />
        <Stack.Screen name="care-circle" options={{ title: 'Care circle' }} />
        <Stack.Screen name="helper" options={{ title: "Sunita's WhatsApp (simulated)" }} />
        <Stack.Screen name="basic-phone" options={{ title: 'Basic phone (simulated)' }} />
        <Stack.Screen name="friend-request" options={{ title: "Friend's WhatsApp (simulated)" }} />
        <Stack.Screen name="friend/[id]" options={{ title: 'Friend' }} />
        <Stack.Screen name="friend-settings" options={{ title: 'My help settings' }} />
        <Stack.Screen name="privacy-profile" options={{ title: 'What friends see' }} />
        <Stack.Screen name="later/daycares" options={{ title: 'Day cares (P1 preview)' }} />
        <Stack.Screen name="later/daycare" options={{ title: 'Day care (P1 preview)' }} />
        <Stack.Screen name="later/dropoff" options={{ title: 'Drop-off (P1 preview)' }} />
        <Stack.Screen name="later/stay" options={{ title: 'Stay (P1 preview)' }} />
        <Stack.Screen name="later/dc-today" options={{ title: 'Day-care staff (P1 preview)' }} />
        <Stack.Screen name="later/dc-handover" options={{ title: 'Pickup handover (P1 preview)' }} />
        <Stack.Screen name="later/dc-showme" options={{ title: 'Show me now (P1 preview)' }} />
        <Stack.Screen name="later/dc-audit" options={{ title: 'Audit result (P1 preview)' }} />
        <Stack.Screen name="later/carers" options={{ title: 'Verified carers (P2 preview)' }} />
        <Stack.Screen name="later/carer-visit" options={{ title: 'Carer visit (P2 preview)' }} />
      </Stack.Protected>
      {/* Opened from a WhatsApp link by the backup, who has no account (PS-102). */}
      <Stack.Screen name="look-in" options={{ title: 'Pawsure look-in' }} />
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  );
}
