import { SchemeFormProvider } from "@/components/context/SchemeFormContext";
import { FarmerProvider } from "@/components/context/FarmerContext";
import { ApplicationFormProvider } from "@/components/context/ApplicationFormContext";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function RootLayout() {
  return (
      <FarmerProvider>
        <ApplicationFormProvider>
          <SchemeFormProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SchemeFormProvider>
        </ApplicationFormProvider>
      </FarmerProvider>
  );
}