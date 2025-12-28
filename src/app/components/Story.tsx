'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { chapters } from '../types';
import FallingPetals from './FallingPetals';
import LightEffects from './LightEffects';
import SoundEffects from './SoundEffects';

const Story = () => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [secretChapter, setSecretChapter] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [kiaraSecret, setKiaraSecret] = useState(false);
  const [firstTapDetected, setFirstTapDetected] = useState(false);
  const [secretTouchTimer, setSecretTouchTimer] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [transformedLetters, setTransformedLetters] = useState<Set<string>>(new Set());

  // Mapa de posiciones donde las letras se transforman en números temporalmente
  const letterTransformations: { [key: number]: { [position: number]: string } } = {
    0: { 6: '1', 8: '4' }, // Capítulo 1: "Hace t[r]ece" → "Hace t[1]ece", "Hace tre[c]e" → "Hace tre[4]e" (14...)
    1: { 20: '0' }, // Capítulo 2: "charlas infi[n]itas" → "charlas infi[0]itas"
    2: { 15: '8' }, // Capítulo 3: "tantas c[o]sas" → "tantas c[8]sas"
    3: { 5: '2' }, // Capítulo 4: "Hub[o] abrazos" → "Hub[2] abrazos"
    4: { 25: '0' }, // Capítulo 5: "como a[n]tes" → "como a[0]tes"
    5: { 50: '1' }, // Capítulo 6: "mundo de f[l]ores" → "mundo de f[1]ores"
    6: { 75: '2' }  // Capítulo 7: "siempre ser[a]s" → "siempre ser[2]s"
  };

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

  // Efecto de typing para el texto con transformaciones temporales
  useEffect(() => {
    setDisplayedText('');
    setShowButtons(false);
    setShowCodeInput(false);
    setTransformedLetters(new Set());
    const text = chapters[currentChapter].text;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));

        // Verificar si esta posición debe transformarse
        const transformations = letterTransformations[currentChapter];
        if (transformations && transformations[i]) {
          const letterKey = `${currentChapter}-${i}`;
          setTransformedLetters(prev => new Set([...prev, letterKey]));

          // Después de 1 segundo, quitar la transformación
          setTimeout(() => {
            setTransformedLetters(prev => {
              const newSet = new Set(prev);
              newSet.delete(letterKey);
              return newSet;
            });
          }, 1000);
        }

        i++;
      } else {
        clearInterval(timer);
        // Mostrar botones o input de código después de terminar el typing
        setTimeout(() => {
          if (currentChapter === 6) {
            setShowCodeInput(true);
          } else {
            setShowButtons(true);
          }
        }, 500);
      }
    }, 50); // Velocidad de typing (50ms por carácter)

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentChapter < chapters.length - 1) {
        if (currentChapter < chapters.length - 1) {
          setCurrentChapter(currentChapter + 1);
        }
      } else if (e.key === 'ArrowLeft' && currentChapter > 0) {
        setCurrentChapter(currentChapter - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentChapter]);

  const handleNext = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  // Mínima distancia para considerar un swipe (en px)
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

    if (isLeftSwipe && currentChapter < chapters.length - 1) {
      // Swipe izquierda = siguiente
      handleNext();
    } else if (isRightSwipe && currentChapter > 0) {
      // Swipe derecha = volver
      setCurrentChapter(currentChapter - 1);
    }
  };

  // Funciones para long press (capítulo secreto)
  const handleMouseDown = () => {
    if (currentChapter === 6) { // Solo en el último capítulo
      const timer = setTimeout(() => {
        setSecretChapter(true);
      }, 2000); // 2 segundos de presión
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Función para toque secreto (mantener pulsado 1 segundo)
  const handleSecretTouch = () => {
    if (currentChapter === 6 && !secretTouchTimer) { // Solo en el último capítulo
      setSecretTouchTimer(true);
      setFirstTapDetected(true);

      // Después de 1 segundo, activar el secreto
      setTimeout(() => {
        if (firstTapDetected) { // Si aún está pulsando
          setKiaraSecret(true);
          setFirstTapDetected(false);
        }
        setSecretTouchTimer(false);
      }, 1000); // 1 segundo
    }
  };

  const handleSecretTouchEnd = () => {
    setFirstTapDetected(false);
    setSecretTouchTimer(false);
  };

  // Verificar código secreto
  const handleCodeSubmit = () => {
    if (secretCode === '14082012') {
      setKiaraSecret(true);
      setShowCodeInput(false);
    } else {
      // Feedback de error - vibrar el input
      setSecretCode('');
      // Podríamos agregar aquí alguna animación de error
    }
  };

  // Modo inmersivo para móviles
  useEffect(() => {
    if (isMobile && currentChapter >= 5) { // Solo en capítulos finales
      const enterFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } catch {
          console.log('Fullscreen not supported');
        }
      };

      // Pequeño delay para mejor UX
      const timer = setTimeout(enterFullscreen, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentChapter, isMobile]);

  const chapter = chapters[currentChapter];
  const isLastChapter = currentChapter === chapters.length - 1;

  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      {/* Efectos visuales y de sonido */}
      {(currentChapter === 5 || currentChapter === 6) && <FallingPetals />}
      {(currentChapter === 5 || currentChapter === 6) && <LightEffects isActive={true} />}
      <SoundEffects
        playTyping={displayedText.length > 0 && displayedText.length < chapters[currentChapter].text.length}
        playChapterTransition={false}
        playSecretReveal={secretChapter}
      />

      {/* Indicador de progreso con línea temporal */}
      <div className={`fixed ${isMobile ? 'top-4' : 'top-6'} left-1/2 transform -translate-x-1/2 z-10`}>
        <div className="flex flex-col items-center space-y-1">
          {/* Línea temporal */}
          <motion.div
            className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 font-light`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            2012 → {currentChapter >= 4 ? '2025' : '¿...?'}
          </motion.div>

          {/* Indicadores de capítulo */}
          <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            {chapters.map((_, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: index === currentChapter ? (isMobile ? 1.4 : 1.3) : index < currentChapter ? (isMobile ? 1.2 : 1.1) : (isMobile ? 1.0 : 0.9),
                  rotate: index <= currentChapter ? 0 : -180,
                  backgroundColor: index <= currentChapter ? '#fbbf24' : '#4b5563'
                }}
                whileHover={!isMobile ? { scale: 1.4 } : {}}
                whileTap={{ scale: isMobile ? 1.3 : 1.2 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} rounded-full cursor-pointer border-2 border-white/20 shadow-lg relative overflow-hidden`}
                onClick={() => setCurrentChapter(index)}
              >
                {/* Efecto de brillo sutil */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: index <= currentChapter ? '100%' : '-100%' }}
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Contador de tiempo sutil */}
      {currentChapter === 0 && (
        <motion.div
          className="fixed top-20 right-6 text-xs text-gray-500 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 3, delay: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          Hace 13 años...
        </motion.div>
      )}

      <div className={`max-w-md w-full ${isMobile ? 'px-2' : 'px-4'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.5,
              ease: currentChapter === 0 ? "easeOut" : currentChapter % 2 === 0 ? "easeIn" : "easeInOut"
            }}
            className="text-center"
          >
            {/* Imagen del capítulo */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                filter: "blur(10px) brightness(0.5)"
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: currentChapter < 3 ? "blur(0px) brightness(1) sepia(0.3) contrast(1.1)" : "blur(0px) brightness(1) sepia(0) contrast(1)"
              }}
              transition={{
                duration: 1.2,
                delay: 0.1,
                filter: { duration: 1.5, delay: 0.3 }
              }}
              className="mb-8 relative"
            >
              <Image
                src={chapter.image}
                alt={chapter.title || `Capítulo ${chapter.id}`}
                width={300}
                height={300}
                className="w-full h-auto rounded-lg shadow-lg mx-auto cursor-pointer"
                priority
                onMouseDown={() => {
                  handleMouseDown();
                  handleSecretTouch();
                }}
                onMouseUp={() => {
                  handleMouseUp();
                  handleSecretTouchEnd();
                }}
                onMouseLeave={() => {
                  handleMouseUp();
                  handleSecretTouchEnd();
                }}
                onTouchStart={(e) => {
                  handleMouseDown();
                  handleSecretTouch();
                  onTouchStart(e);
                }}
                onTouchEnd={() => {
                  handleMouseUp();
                  handleSecretTouchEnd();
                  onTouchEnd();
                }}
              />

              {/* Efecto de desvanecimiento/memoria */}
              <motion.div
                className="absolute inset-0 bg-white/10 rounded-lg"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.1, 0.3] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
            </motion.div>

            {/* Título del capítulo (solo si existe) */}
            {chapter.title && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-bold text-white mb-6"
              >
                {chapter.title}
              </motion.h1>
            )}

            {/* Texto narrativo con efecto typing y números especiales */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: chapter.title ? 0.6 : 0.4 }}
              className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-300 mb-8 leading-relaxed px-2 min-h-[120px] flex items-center`}
            >
              <p className="text-center">
                {displayedText.split('').map((char, index) => {
                  const letterKey = `${currentChapter}-${index}`;
                  const isTransformed = transformedLetters.has(letterKey);
                  const transformations = letterTransformations[currentChapter];
                  const shouldTransform = transformations && transformations[index];
                  const transformedChar = shouldTransform ? transformations[index] : char;
                  const isLastChar = index === displayedText.length - 1;

                  if (isTransformed && shouldTransform) {
                    return (
                      <motion.span
                        key={index}
                        initial={{ scale: 1, color: '#d1d5db' }}
                        animate={{
                          scale: [1, 1.3, 1],
                          color: ['#fbbf24', '#fbbf24', '#fbbf24'],
                          textShadow: [
                            '0 0 0px #fbbf24',
                            '0 0 20px #fbbf24, 0 0 30px #fbbf24',
                            '0 0 0px #fbbf24'
                          ]
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        className="inline-block font-bold"
                      >
                        {transformedChar}
                      </motion.span>
                    );
                  }

                  return (
                    <span key={index} className={isLastChar ? 'relative' : ''}>
                      {char}
                      {isLastChar && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                          className="text-yellow-400 absolute"
                        >
                          |
                        </motion.span>
                      )}
                    </span>
                  );
                })}
              </p>
            </motion.div>


            {/* Navegación condicional: input de código en capítulo 7, botones en otros */}
            {currentChapter === 6 ? (
              // Input de código secreto para capítulo 7
              <AnimatePresence>
                {showCodeInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xs mx-auto space-y-4"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-3">
                        Hay un capítulo secreto para desbloquear.<br />
                        En las historias se te mostraron pistas, ingresa acá el resultado.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="Código secreto"
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-center text-lg font-mono focus:border-yellow-400 focus:outline-none transition-colors"
                          maxLength={8}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCodeSubmit}
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          Desbloquear ✨
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : currentChapter === 6 ? (
              // Input de código secreto para capítulo 7 (móvil)
              <AnimatePresence>
                {showCodeInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xs mx-auto space-y-4 px-4"
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-3">
                        Hay un capítulo secreto para desbloquear.<br />
                        En las historias se te mostraron pistas, ingresa acá el resultado.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          placeholder="Código secreto"
                          className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-center text-lg font-mono focus:border-yellow-400 focus:outline-none transition-colors"
                          maxLength={8}
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCodeSubmit}
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                        >
                          Desbloquear ✨
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : !isMobile ? (
              // Botones para desktop (capítulos que no son 7)
              <AnimatePresence>
                {showButtons && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center w-full max-w-xs mx-auto"
                  >
                    {/* Botón volver (solo si no es el primer capítulo) */}
                    {currentChapter > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentChapter(currentChapter - 1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                      >
                        ← Volver
                      </motion.button>
                    )}

                    {/* Espacio vacío si no hay botón volver */}
                    {currentChapter === 0 && <div />}

                    {/* Botón siguiente (solo si no es el último capítulo) */}
                    {!isLastChapter && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
                      >
                        Siguiente →
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              // Indicadores de swipe para móvil
              <AnimatePresence>
                {showButtons && !isLastChapter && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center space-y-3 mt-8 px-4"
                  >
                    {/* Indicadores de swipe */}
                    <div className="flex items-center justify-center space-x-6 text-gray-400">
                      {currentChapter > 0 && (
                        <motion.div
                          animate={{ x: [-5, 0, -5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex flex-col items-center space-y-1"
                        >
                          <span className="text-lg">←</span>
                          <span className="text-xs text-center">Volver</span>
                        </motion.div>
                      )}
                      {!isLastChapter && (
                        <motion.div
                          animate={{ x: [5, 0, 5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="flex flex-col items-center space-y-1"
                        >
                          <span className="text-lg">→</span>
                          <span className="text-xs text-center">Deslizá</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Indicador visual de swipe mejorado */}
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-3 h-3 bg-yellow-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        className="w-3 h-3 bg-yellow-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        className="w-3 h-3 bg-yellow-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Indicador de espera (se adapta al dispositivo) */}
            {!isLastChapter && !showButtons && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                className="text-sm text-gray-500 mt-4 text-center"
              >
                {isMobile ? "Espera mientras se escribe..." : "Espera mientras se escribe..."}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Capítulo secreto */}
      <AnimatePresence>
        {secretChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSecretChapter(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-8 rounded-lg max-w-md mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4"
              >
                💛
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-4">Capítulo Secreto</h3>
              <p className="text-gray-300 leading-relaxed">
                Gracias por llegar hasta aquí. Esta historia es solo el comienzo de muchas más que vendrán.
                Cada momento que compartimos es un tesoro que guardo en mi corazón.
                <br /><br />
                <span className="text-yellow-400 font-semibold">Te quiero mucho. 💕</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSecretChapter(false)}
                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-full transition-colors"
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de long press */}
      {longPressTimer && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-gray-800 px-6 py-3 rounded-full text-white text-sm"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            Mantén presionado...
          </motion.div>
        </motion.div>
      )}

      {/* Indicador de toque secreto (mantener pulsado) */}
      {firstTapDetected && currentChapter === 6 && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex items-center justify-center z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-2xl text-white text-sm font-semibold shadow-2xl border-2 border-white/30"
            initial={{ scale: 0.8, y: 20, rotate: -5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, y: -20, rotate: 5 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex items-center space-x-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👆
              </motion.span>
              <span>Mantén pulsado para el secreto</span>
              <motion.div
                className="flex space-x-1"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Capítulo secreto de Kiara */}
      <AnimatePresence>
        {kiaraSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-pink-900/95 via-purple-900/95 to-yellow-900/95 flex items-center justify-center z-50"
            onClick={() => setKiaraSecret(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`${isMobile ? 'p-6 mx-2' : 'p-8 mx-4'} bg-white/10 backdrop-blur-sm rounded-2xl max-w-md text-center shadow-2xl border border-white/20`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagen de Kiara */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-6"
              >
                <Image
                  src="/story/Kiara.png"
                  alt="Kiara"
                  width={isMobile ? 200 : 250}
                  height={isMobile ? 200 : 250}
                  className="w-full h-auto rounded-xl shadow-lg mx-auto"
                  priority
                />
              </motion.div>

              {/* Corazón animado */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`${isMobile ? 'text-5xl mb-3' : 'text-6xl mb-4'}`}
              >
                💖
              </motion.div>

              {/* Mensaje */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`${isMobile ? 'text-xl font-bold text-white mb-3' : 'text-2xl font-bold text-white mb-4'}`}
              >
                ¡Te amamos mucho!
              </motion.h2>

              {/* Partículas flotantes */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${20 + i * 8}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    rotate: [0, 360],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                >
                  {['🌸', '💛', '✨', '🌟'][i % 4]}
                </motion.div>
              ))}

              <motion.button
                whileHover={!isMobile ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => setKiaraSecret(false)}
                className={`${isMobile ? 'mt-4 py-2 px-4 text-sm' : 'mt-6 py-2 px-6'} bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg`}
              >
                ← Volver
              </motion.button>

              {/* Botón Segunda Parte */}
              <motion.a
                href="/fases"
                whileHover={!isMobile ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`${isMobile ? 'mt-3 py-3 px-6 text-sm' : 'mt-4 py-3 px-8'} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
              >
                🌙 Segunda Parte
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Story;