import { ApplicationFormProvider } from "@/components/context/ApplicationFormContext";
import { FarmerProvider } from "@/components/context/FarmerContext";
import { SchemeFormProvider } from "@/components/context/SchemeFormContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context"; // ← change to SafeAreaProvider

export default function RootLayout() {
  return (
    <SafeAreaProvider> {/* ← wrap everything */}
      <FarmerProvider>
        <ApplicationFormProvider>
          <SchemeFormProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SchemeFormProvider>
        </ApplicationFormProvider>
      </FarmerProvider>
    </SafeAreaProvider>
  );
}