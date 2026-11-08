import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold } from '@expo-google-fonts/mukta';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/js-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Icon } from '../design/Icon';
import { color } from '../design/theme';
import { AuthProvider, useAuth } from '../lib/auth';
import { PrototypeProvider, useProto } from '../proto/store';
import { ToastProvider } from '../design/states';

const INLINE_FONTS = process.env.EXPO_PUBLIC_INLINE_FONTS === '1';

export default function RootLayout() {
  // The shareable prototype page embeds the fonts itself (EXPO_PUBLIC_INLINE_FONTS=1) and cannot fetch them.
  const [loaded, error] = useFonts(INLINE_FONTS ? {} : { Baloo2_700Bold, Baloo2_800ExtraBold, Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold });
  // Fall back to system fonts rather than block the app if fonts fail to load.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  return (
    <AuthProvider>
      <PrototypeProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Routes />
        </ToastProvider>
      </PrototypeProvider>
    </AuthProvider>
  );
}

function Routes() {
  const { signedIn, restoring } = useAuth();
  const { state } = useProto();
  const inApp = signedIn && state.onboarded;
  if (restoring) return <View style={{ flex: 1, backgroundColor: color.bg.canvas }} />;
  return (
    <Stack
      screenOptions={{
        headerTintColor: color.text.primary,
        headerStyle: { backgroundColor: color.bg.canvas },
        headerShadowVisible: false,
        // Mockup header: centred bold title between the back chevron and actions.
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: 'Baloo2_700Bold', fontSize: 20 },
        // flex + overflow keep every card the height of the window on web, so each Screen's ScrollView scrolls.
        // Without it the web stack lets cards grow past the window and expects the page to scroll, but the
        // body never scrolls, so long screens (onboarding "Your privacy") were cut off.
        cardStyle: { backgroundColor: color.bg.canvas, flex: 1, overflow: 'hidden' },
        // Our own icon instead of the library PNG: consistent style, and no image file to fetch.
        headerBackImage: () => <Icon name="chevronLeft" tint={color.text.primary} />,
        headerBackTitle: 'Back',
        headerBackAccessibilityLabel: 'Back',
      }}
    >
      <Stack.Protected guard={inApp} redirectTo={signedIn ? '/onboarding/profile' : '/welcome'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="helper-invite" options={{ title: 'Invite your helper' }} />
        <Stack.Screen name="helper-history" options={{ title: "Sunita's check-ins" }} />
        <Stack.Screen name="rewards" options={{ title: 'Rewards' }} />
        <Stack.Screen name="health" options={{ title: 'Health' }} />
        <Stack.Screen name="pilot" options={{ title: 'Pilot settings' }} />
        <Stack.Screen name="coverage" options={{ title: 'What this prototype covers' }} />
        <Stack.Screen name="add-pet" options={{ title: 'Add a pet' }} />
        <Stack.Screen name="later/certificate" options={{ title: 'Certificate (P1 preview)' }} />
        <Stack.Screen name="later/carer" options={{ title: 'Carer profile (P2 preview)' }} />
        <Stack.Screen name="return-check" options={{ title: 'Return check', presentation: 'modal' }} />
        <Stack.Screen name="styleguide" options={{ title: 'Style guide' }} />
        <Stack.Screen name="icons" options={{ title: 'Icons' }} />
        <Stack.Screen name="demo-time" options={{ title: 'Demo time' }} />
        <Stack.Screen name="prototype" options={{ title: 'All screens' }} />
        <Stack.Screen name="notifications" options={{ title: 'Alerts' }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Task' }} />
        <Stack.Screen name="missed/[id]" options={{ title: 'Missed check-in' }} />
        <Stack.Screen name="day-report" options={{ title: 'Day report' }} />
        <Stack.Screen name="emergency" options={{ title: 'Emergency' }} />
        <Stack.Screen name="code-card" options={{ title: 'Food-box code card' }} />
        <Stack.Screen name="pet-edit" options={{ title: 'Pet profile' }} />
        <Stack.Screen name="care-circle" options={{ title: 'Care circle' }} />
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
      {/* Used both during onboarding and in the app. */}
      <Stack.Protected guard={signedIn} redirectTo="/welcome">
        <Stack.Screen name="routine" options={{ title: 'Routine' }} />
        <Stack.Screen name="helper" options={{ title: "Helper's WhatsApp (simulated)" }} />
        <Stack.Screen name="basic-phone" options={{ title: 'Basic phone (simulated)' }} />
      </Stack.Protected>
      {/* Signed in, still setting up: registration, consent, pet, routine, care circle. */}
      <Stack.Protected guard={signedIn && !state.onboarded} redirectTo={signedIn ? '/' : '/welcome'}>
        <Stack.Screen name="onboarding/profile" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/consent" options={{ title: '' }} />
        <Stack.Screen name="onboarding/pet" options={{ title: '' }} />
        <Stack.Screen name="onboarding/pet-care" options={{ title: '' }} />
        <Stack.Screen name="onboarding/routine" options={{ title: '' }} />
        <Stack.Screen name="onboarding/circle" options={{ title: '' }} />
        <Stack.Screen name="onboarding/invite-helper" options={{ title: '' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  );
}
