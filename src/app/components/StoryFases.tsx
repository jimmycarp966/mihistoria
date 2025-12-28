'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { chaptersFases } from '../typesFases';
import FallingStars from './FallingStars';
import MoonPhase from './MoonPhase';
import YouTubeAudio from './YouTubeAudio';

const StoryFases = () => {
    const [currentChapter, setCurrentChapter] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [showButtons, setShowButtons] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showMusicPrompt, setShowMusicPrompt] = useState(true);
    const [isContentVisible, setIsContentVisible] = useState(false);

    // Resetear visibilidad al cambiar de capítulo (para esperar al buffer del siguiente audio)
    useEffect(() => {
        setIsContentVisible(false);
    }, [currentChapter]);


    const [stars, setStars] = useState<{ id: number; style: React.CSSProperties }[]>([]);

    // Generar estrellas en el cliente para evitar hidratación mismatch
    useEffect(() => {
        const generatedStars = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            style: {
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.3 + Math.random() * 0.7,
            }
        }));
        setStars(generatedStars);
    }, []);

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkMobile = () => {
            const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
                ('ontouchstart' in window) ||
                window.innerWidth <= 768;
            setIsMobile(mobileCheck);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Efecto de typing para el texto
    useEffect(() => {
        if (!isContentVisible) return;

        setDisplayedText('');
        setShowButtons(false);
        const text = chaptersFases[currentChapter].text;
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
                setTimeout(() => setShowButtons(true), 500);
            }
        }, 200);

        return () => clearInterval(timer);
    }, [currentChapter, isContentVisible]);

    // Navegación con teclado
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && currentChapter < chaptersFases.length - 1) {
                if (isContentVisible) handleNext();
            } else if (e.key === 'ArrowLeft' && currentChapter > 0) {
                if (isContentVisible) {
                    setIsContentVisible(false);
                    setCurrentChapter(currentChapter - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentChapter, isContentVisible]);

    const handleNext = () => {
        if (currentChapter < chaptersFases.length - 1) {
            setIsContentVisible(false); // Ocultar inmediatamente
            setCurrentChapter(currentChapter + 1);
        }
    };

    // Touch gestures
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentChapter < chaptersFases.length - 1) {
            handleNext();
        } else if (isRightSwipe && currentChapter > 0) {
            setIsContentVisible(false);
            setCurrentChapter(currentChapter - 1);
        }
    };

    const startExperience = () => {
        setShowMusicPrompt(false);
        setIsPlaying(true);
    };

    const chapter = chaptersFases[currentChapter];
    const isLastChapter = currentChapter === chaptersFases.length - 1;

    // Calcular opacidad del fondo basado en la fase (de claro a oscuro)
    const bgOpacity = 0.3 + (currentChapter * 0.15);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: `linear-gradient(to bottom, 
          rgba(15, 23, 42, ${bgOpacity}) 0%, 
          rgba(30, 41, 59, ${bgOpacity + 0.1}) 50%, 
          rgba(15, 23, 42, ${bgOpacity + 0.2}) 100%)`,
            }}
            onTouchStart={isMobile ? onTouchStart : undefined}
            onTouchMove={isMobile ? onTouchMove : undefined}
            onTouchEnd={isMobile ? onTouchEnd : undefined}
        >
            {/* Fondo de estrellas fijo y dinámico */}
            <motion.div
                className="fixed inset-0 z-0"
                animate={{
                    background: chapter.colorTheme || 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d15 100%)',
                }}
                transition={{ duration: 3 }}
            />

            {/* Estrellas estáticas de fondo (Renderizado en cliente) */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white"
                        style={star.style}
                    />
                ))}
            </div>

            {/* Estrellas cayendo */}
            <FallingStars mode={chapter.particleMode} />

            {/* Prompt inicial para activar música */}
            <AnimatePresence>
                {showMusicPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center p-8 max-w-md"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-6xl mb-6"
                            >
                                🌙
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-4">Fases</h2>
                            <p className="text-gray-300 mb-6">
                                Una historia contada a través de las fases de la luna, con música que la acompaña.
                            </p>
                            <p className="text-sm text-gray-400 mb-8">
                                🎧 Recomendamos usar auriculares
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startExperience}
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                Comenzar ✨
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* YouTube Player (hidden) - Controla la visibilidad */}
            {isPlaying && (
                <YouTubeAudio
                    videoId={chapter.youtubeId}
                    isPlaying={isPlaying}
                    volume={75}
                    startSeconds={chapter.startSeconds}
                    onAudioPlay={() => setIsContentVisible(true)}
                />
            )}

            {/* Contenido Visual Sincronizado */}
            <AnimatePresence mode="wait">
                {isContentVisible && (
                    <motion.div
                        key="content-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="contents" // Para no romper layout flex/grid si lo hubiera
                    >
                        {/* Indicador de progreso con fases de luna */}
                        <div className={`fixed ${isMobile ? 'top-4' : 'top-6'} left-1/2 transform -translate-x-1/2 z-20`}>
                            <div className="flex flex-col items-center space-y-2">
                                {/* Nombre de la fase actual */}
                                <motion.div
                                    key={chapter.phaseName}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-gray-300 font-light"
                                >
                                    {chapter.phaseEmoji} {chapter.phaseName}
                                </motion.div>

                                {/* Indicadores de capítulo con fases de luna */}
                                <div className={`flex ${isMobile ? 'space-x-3' : 'space-x-4'}`}>
                                    {chaptersFases.map((ch, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{
                                                scale: index === currentChapter ? 1.2 : 1,
                                                opacity: index <= currentChapter ? 1 : 0.4,
                                            }}
                                            whileHover={{ scale: 1.3 }}
                                            whileTap={{ scale: 1.1 }}
                                            transition={{ duration: 0.3 }}
                                            className="cursor-pointer"
                                            onClick={() => setCurrentChapter(index)}
                                        >
                                            <MoonPhase
                                                phase={ch.phase}
                                                size={isMobile ? 24 : 28}
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contenido principal */}
                        <div className={`max-w-md w-full ${isMobile ? 'px-2' : 'px-4'} z-10 relative`}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentChapter}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-center"
                                >
                                    {/* Luna grande decorativa */}
                                    <motion.div
                                        className="flex justify-center mb-6"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 4.0 }}
                                    >
                                        <MoonPhase phase={chapter.phase} size={isMobile ? 100 : 120} />
                                    </motion.div>

                                    {/* Imagen del capítulo */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 5.0, delay: 0.5 }}
                                        className="mb-6 relative"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                                            className="relative overflow-hidden rounded-xl shadow-2xl"
                                        >
                                            <Image
                                                src={chapter.image}
                                                alt={chapter.title}
                                                width={400}
                                                height={400}
                                                className="w-full h-auto"
                                                priority
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            {/* Overlay con gradiente lunar */}
                                            <div
                                                className="absolute inset-0 pointer-events-none z-20"
                                                style={{
                                                    background: `linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.8) 100%)`,
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Título del capítulo */}
                                    {chapter.title && (
                                        <motion.h1
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 2.0, delay: 1.0 }}
                                            className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-4`}
                                        >
                                            {chapter.title}
                                        </motion.h1>
                                    )}

                                    {/* Texto narrativo con efecto typing */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 2.0, delay: 1.5 }}
                                        className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-300 mb-8 leading-relaxed px-2 min-h-[100px] flex items-center justify-center`}
                                    >
                                        <p className="text-center italic">
                                            &quot;{displayedText}
                                            <motion.span
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                                className="text-purple-400"
                                            >
                                                |
                                            </motion.span>
                                            &quot;
                                        </p>
                                    </motion.div>

                                    {/* Navegación */}
                                    {!isMobile ? (
                                        <AnimatePresence>
                                            {showButtons && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="flex justify-between items-center w-full max-w-xs mx-auto"
                                                >
                                                    {currentChapter > 0 && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setIsContentVisible(false);
                                                                setCurrentChapter(currentChapter - 1);
                                                            }}
                                                            className="bg-gray-700/80 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 shadow-lg backdrop-blur-sm"
                                                        >
                                                            ← Volver
                                                        </motion.button>
                                                    )}

                                                    {currentChapter === 0 && <div />}

                                                    {!isLastChapter ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleNext}
                                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg"
                                                        >
                                                            Siguiente →
                                                        </motion.button>
                                                    ) : (
                                                        <motion.a
                                                            href="/"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg"
                                                        >
                                                            🏠 Volver al inicio
                                                        </motion.a>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    ) : (
                                        <AnimatePresence>
                                            {showButtons && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="flex flex-col items-center space-y-4"
                                                >
                                                    {!isLastChapter ? (
                                                        <>
                                                            <div className="flex items-center justify-center space-x-6 text-gray-400">
                                                                {currentChapter > 0 && (
                                                                    <motion.div
                                                                        animate={{ x: [-5, 0, -5] }}
                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                        className="flex flex-col items-center space-y-1"
                                                                    >
                                                                        <span className="text-lg">←</span>
                                                                        <span className="text-xs">Volver</span>
                                                                    </motion.div>
                                                                )}
                                                                <motion.div
                                                                    animate={{ x: [5, 0, 5] }}
                                                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                                                    className="flex flex-col items-center space-y-1"
                                                                >
                                                                    <span className="text-lg">→</span>
                                                                    <span className="text-xs">Deslizá</span>
                                                                </motion.div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                {[0, 1, 2].map((i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{ scale: [1, 1.3, 1] }}
                                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <motion.a
                                                            href="/"
                                                            whileTap={{ scale: 0.95 }}
                                                            className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
                                                        >
                                                            🏠 Volver al inicio
                                                        </motion.a>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Indicador de canción actual */}
            {isPlaying && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed ${isMobile ? 'bottom-4' : 'bottom-6'} left-1/2 transform -translate-x-1/2 z-20`}
                >
                    <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-purple-400"
                        >
                            🎵
                        </motion.div>
                        <span className="text-xs text-gray-300">Reproduciendo...</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StoryFases;
