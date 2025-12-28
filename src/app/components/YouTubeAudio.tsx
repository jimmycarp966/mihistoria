'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubeAudioProps {
    videoId: string;
    isPlaying: boolean;
    volume?: number;
    startSeconds?: number;
    onAudioPlay?: () => void;
    onAudioPause?: () => void;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        YT: any;
    }
}

const YouTubeAudio: React.FC<YouTubeAudioProps> = ({ videoId, isPlaying, volume = 50, startSeconds = 0, onAudioPlay, onAudioPause }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isApiReady, setIsApiReady] = useState(false);

    // Cargar API de YouTube
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setIsApiReady(true);
            };
        } else {
            setIsApiReady(true);
        }
    }, []);

    // Inicializar Player
    useEffect(() => {
        if (isApiReady && containerRef.current && !playerRef.current) {
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '1',
                width: '1',
                videoId: videoId,
                playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    loop: 1,
                    playlist: videoId, // Necesario para loop
                    start: startSeconds,
                },
                events: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onReady: (event: any) => {
                        event.target.setVolume(volume);
                        if (isPlaying) {
                            event.target.playVideo();
                        }
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onStateChange: (event: any) => {
                        // YT.PlayerState.PLAYING = 1
                        if (event.data === 1 && onAudioPlay) {
                            onAudioPlay();
                        }
                        // YT.PlayerState.PAUSED = 2, BUFFERING = 3, ENDED = 0
                        if ((event.data === 2 || event.data === 3) && onAudioPause) {
                            onAudioPause();
                        }
                    },
                    onError: () => {
                        // console.error('[YouTubeAudio] Error del Player');
                    }
                },
            });
        }
    }, [isApiReady, videoId]); // Recrear si cambia ID

    // Controlar reproducción y volumen dinámicamente
    useEffect(() => {
        if (playerRef.current && playerRef.current.playVideo) {
            if (isPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
            playerRef.current.setVolume(volume);
        }
    }, [isPlaying, volume]);

    // Actualizar video si cambia ID
    useEffect(() => {
        if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(videoId, startSeconds);
            if (isPlaying) {
                playerRef.current.playVideo();
            }
        }
    }, [videoId, startSeconds]);

    return <div ref={containerRef} className="hidden" />;
};

export default YouTubeAudio;
