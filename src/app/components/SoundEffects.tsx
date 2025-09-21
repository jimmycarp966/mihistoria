'use client';

import { useEffect, useRef } from 'react';

interface SoundEffectsProps {
  playTyping?: boolean;
  playChapterTransition?: boolean;
  playSecretReveal?: boolean;
}

const SoundEffects = ({ playTyping, playChapterTransition, playSecretReveal }: SoundEffectsProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializar AudioContext
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };

    // Crear sonidos programáticamente
    const createTypingSound = () => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    };

    const createTransitionSound = () => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    };

    const createSecretSound = () => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;

      // Crear una secuencia de notas
      [523, 659, 784, 1047].forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
        }, index * 150);
      });
    };

    if (playTyping) {
      initAudio();
      createTypingSound();
    }

    if (playChapterTransition) {
      initAudio();
      createTransitionSound();
    }

    if (playSecretReveal) {
      initAudio();
      createSecretSound();
    }

  }, [playTyping, playChapterTransition, playSecretReveal]);

  return null; // Este componente no renderiza nada visual
};

export default SoundEffects;
