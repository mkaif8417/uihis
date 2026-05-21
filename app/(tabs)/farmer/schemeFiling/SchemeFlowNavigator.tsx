import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SchemeFormProvider } from '../../../../components/context/SchemeFormContext';
import ComponentDetailsStep from './compDtls';
import LandAreaStep from './LandAreaStep';
import LandLocationStep from './LandLocationStep';
import ReviewStep from './ReviewStep';

const Stack = createNativeStackNavigator();

export default function SchemeFlowNavigator() {
  return (
    <SchemeFormProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ComponentDetailsStep" component={ComponentDetailsStep} />
        <Stack.Screen name="LandAreaStep" component={LandAreaStep} />
        <Stack.Screen name="LandLocationStep" component={LandLocationStep} />
        <Stack.Screen name="ReviewStep" component={ReviewStep} />
      </Stack.Navigator>
    </SchemeFormProvider>
  );
}
