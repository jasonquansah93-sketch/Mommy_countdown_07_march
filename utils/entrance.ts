/**
 * useSessionEntrance — cinematic staggered entrance for the Home screen.
 *
 * Plays ONCE per app session. The animation mimics the paywall's slide-up:
 * each section fades in and rises from 40px below its final position.
 *
 * Sections are staggered by `STAGGER_MS` so they cascade beautifully.
 *
 * Usage:
 *   const { animStyle } = useSessionEntrance(index);
 *   <Animated.View style={animStyle}> ... </Animated.View>
 *
 * When Reduce Motion is enabled, all values are set to final state immediately.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from './motion';

const DURATION_MS = 620;
const STAGGER_MS = 90;
const RISE_PX = 44;

// Module-level flag — persists for the lifetime of the JS runtime (one session).
let _sessionPlayed = false;

export function resetSessionEntrance() {
  _sessionPlayed = false;
}

export function useSessionEntrance(index: number) {
  const reducedMotion = useReducedMotion();
  const alreadyPlayed = _sessionPlayed;

  const opacity = useRef(
    new Animated.Value(alreadyPlayed || reducedMotion ? 1 : 0)
  ).current;
  const translateY = useRef(
    new Animated.Value(alreadyPlayed || reducedMotion ? 0 : RISE_PX)
  ).current;

  useEffect(() => {
    if (alreadyPlayed || reducedMotion) return;

    const delay = index * STAGGER_MS;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DURATION_MS,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: DURATION_MS,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Mark session as played after the last section's animation completes.
      if (index === 0) _sessionPlayed = true;
    });
  }, []);

  return {
    animStyle: {
      opacity,
      transform: [{ translateY }],
    },
  };
}
