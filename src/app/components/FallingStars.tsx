'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FallingStarsProps {
    mode?: 'stars' | 'rain' | 'fireflies' | 'embers';
}

interface Particle {
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
    opacity: number;
}

const FallingStars = ({ mode = 'stars' }: FallingStarsProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const count = mode === 'rain' ? 60 : mode === 'embers' ? 40 : 25;
        setParticles(Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 5,
            duration: mode === 'rain' ? 0.5 + Math.random() * 0.5 : mode === 'fireflies' ? 10 + Math.random() * 10 : 3 + Math.random() * 4,
            size: mode === 'rain' ? 1 + Math.random() : mode === 'embers' ? 3 + Math.random() * 3 : 2 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.7,
        })));
    }, [mode]);

    const getAnimation = (p: Particle) => {
        switch (mode) {
            case 'rain':
                return {
                    y: ['-10vh', '110vh'],
                    opacity: [0, p.opacity, p.opacity, 0],
                };
            case 'embers':
                return {
                    y: ['110vh', '-10vh'],
                    x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 20}%`],
                    opacity: [0, p.opacity, 0],
                    scale: [0.5, 1, 0],
                };
            case 'fireflies':
                return {
                    x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 30}%`, `${p.x}%`],
                    y: [`${p.y}%`, `${p.y + (Math.random() - 0.5) * 30}%`, `${p.y}%`],
                    opacity: [0, 1, 0, 1, 0],
                };
            case 'stars':
            default:
                return {
                    y: ['-10vh', '110vh'],
                    opacity: [0, p.opacity, p.opacity, 0],
                    rotate: [0, 360],
                };
        }
    };

    const getColor = () => {
        switch (mode) {
            case 'rain': return 'rgba(173, 216, 230, 0.6)';
            case 'embers': return 'rgba(255, 140, 0, 0.7)';
            case 'fireflies': return 'rgba(220, 255, 100, 0.8)';
            default: return 'white';
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-10 transition-colors duration-1000">
            {particles.map((p) => (
                <motion.div
                    key={`${mode}-${p.id}`}
                    className="absolute"
                    style={{
                        left: mode === 'fireflies' ? undefined : `${p.x}%`,
                        top: mode === 'stars' || mode === 'rain' ? '-20px' : mode === 'embers' ? '110vh' : undefined,
                        width: mode === 'rain' ? '1px' : undefined,
                    }}
                    animate={getAnimation(p)}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: mode === 'rain' ? 'linear' : 'easeInOut',
                    }}
                >
                    <div
                        className={`rounded-full shadow-lg ${mode === 'rain' ? 'h-4 w-0.5' : ''}`}
                        style={{
                            backgroundColor: getColor(),
                            width: mode === 'rain' ? '1px' : `${p.size}px`,
                            height: mode === 'rain' ? '15px' : `${p.size}px`,
                            boxShadow: mode === 'stars' || mode === 'fireflies' ? `0 0 ${p.size * 2}px ${p.size}px ${getColor()}` : 'none',
                        }}
                    />
                </motion.div>
            ))}

            {(mode === 'stars' || mode === 'embers') && [0, 1, 2].map((i) => (
                <motion.div
                    key={`shooting-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        left: `${20 + i * 30}%`,
                        top: '-10px',
                    }}
                    animate={{
                        x: [0, 200],
                        y: [0, 300],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        delay: 5 + i * 7,
                        repeat: Infinity,
                        repeatDelay: 15,
                    }}
                >
                    <motion.div
                        className="absolute w-20 h-0.5 bg-gradient-to-l from-white to-transparent -left-20"
                        style={{ transform: 'rotate(45deg)' }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default FallingStars;
