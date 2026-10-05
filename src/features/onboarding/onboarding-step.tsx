import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressSegments } from '@/components/ui/progress-segments';
import { Text } from '@/components/ui/text';

/**
 * Shared onboarding layout: 3-segment progress, "Step N of 3", title 24sp/600, body 14sp,
 * content, CTA pinned to the bottom (24dp sides, 32dp bottom).
 */
export function OnboardingStep({
  step,
  title,
  body,
  footer,
  children,
}: PropsWithChildren<{ step: number; title: string; body: string; footer: React.ReactNode }>) {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <ProgressSegments total={3} current={step} />
          <View className="mt-7 gap-2">
            <Text weight="semibold" className="text-[12px] text-muted">
              Step {step} of 3
            </Text>
            <Text
              weight="semibold"
              className="text-[24px] leading-[30px]"
              style={{ letterSpacing: -0.4 }}
            >
              {title}
            </Text>
            <Text className="text-[14px] leading-[21px] text-muted">{body}</Text>
          </View>
          <View className="mt-6 gap-4">{children}</View>
        </ScrollView>
        <View className="px-6 pb-8 pt-2">{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
