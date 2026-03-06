/**
 * Reduced-motion accessibility hook.
 *
 * Returns `true` when the user has enabled "Reduce Motion" in iOS/Android
 * Accessibility settings. All animated components must check this value and
 * either skip animations entirely or jump to the final state immediately.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Read initial value synchronously on mount
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);

    // Subscribe to changes (user may toggle setting while app is open)
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => subscription.remove();
  }, []);

  return reducedMotion;
}
