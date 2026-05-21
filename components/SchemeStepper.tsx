import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

const steps = [
  'Component Details',
  'Land Area & Other Details',
  'Land Location',
  'Review & Edit',
];

function Stepper({
  currentStep,
  steps,
  stepValid,
  onStepPress,
}: {
  steps: string[];
  currentStep: number;
  stepValid: boolean[];
  onStepPress: (index: number) => void;
}) {
  if (!Array.isArray(stepValid)) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {steps.map((label, index) => {

          return (
            <Pressable
              key={index}
              onPress={() => onStepPress(index)}
              style={{ alignItems: "center", marginRight: 18, opacity: 1 }}
            >
              <View
                style={[
                  styles.circle,
                  index === currentStep && styles.activeCircle,
                  stepValid[index] && styles.doneCircle,
                ]}
              >
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepLabel}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function SchemeStepper({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const active = index === currentStep;
        const completed = index < currentStep;

        return (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.circle,
                active && styles.activeCircle,
                completed && styles.completedCircle,
              ]}
            >
              <Text style={styles.circleText}>{index + 1}</Text>
            </View>

            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
                completed && styles.completedLabel,
              ]}
            >
              {label}
            </Text>

            {index !== steps.length - 1 && (
              <View style={styles.line} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#e8f5e9',
    justifyContent: 'space-between',
  },
  doneCircle: {
    backgroundColor: "#388e3c",
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#bdbdbd',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  activeCircle: {
    backgroundColor: '#2e7d32',
  },
  completedCircle: {
    backgroundColor: '#388e3c',
  },
  circleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    color: '#555',
  },
  activeLabel: {
    color: '#2e7d32',
    fontWeight: '700',
  },
  completedLabel: {
    color: '#388e3c',
  },
  line: {
    position: 'absolute',
    top: 13,
    right: -50,
    height: 2,
    width: 100,
    backgroundColor: '#bdbdbd',
    zIndex: 1,
  },
});
