'use client';

import { useCallback, useRef } from 'react';
import { getAudioContext, playEngineSound, playDoorThud, playChime } from '@/lib/audio';

/**
 * Handles unlocking the AudioContext (must happen on a user gesture)
 * and playing the timed engine → door → chime sequence.
 */
export function useEngineSound() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Call this inside a click handler to unlock audio in the browser. */
  const unlockAudio = useCallback(() => {
    getAudioContext();
  }, []);

  /** Plays the full intro sound sequence (engine, door thud, chime). */
  const playIntroSequence = useCallback((withSound: boolean) => {
    // clear any pending timers from a previous replay
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (!withSound) return;

    playEngineSound();
    timers.current.push(setTimeout(playDoorThud, 1550));
    timers.current.push(setTimeout(playChime, 1950));
  }, []);

  return { unlockAudio, playIntroSequence };
}