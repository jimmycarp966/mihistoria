export interface ChapterFases {
    id: number;
    phase: 'full' | 'waning' | 'quarter' | 'waxing' | 'new';
    phaseEmoji: string;
    phaseName: string;
    title: string;
    text: string;
    youtubeId: string; // YouTube video ID para embed
    image: string;
    startSeconds?: number;
    colorTheme?: string; // Clase Tailwind o valor CSS de fondo
    particleMode?: 'stars' | 'rain' | 'fireflies' | 'embers';
}

export const chaptersFases: ChapterFases[] = [
    {
        id: 1,
        phase: 'full',
        phaseEmoji: '🌕',
        phaseName: 'Luna Llena',
        title: 'Lo que era',
        text: 'Hubo un tiempo donde todo brillaba. Donde la luna estaba llena y nosotros también. Donde no había sombras entre los dos...',
        youtubeId: 'zABLecsR5UE', // Someone You Loved (Lyric Video) - Más probable que permita embed
        image: '/fases/1.png',
        startSeconds: 24,
        colorTheme: 'bg-slate-900',
        particleMode: 'stars'
    },
    {
        id: 2,
        phase: 'waning',
        phaseEmoji: '🌔',
        phaseName: 'Menguante',
        title: 'La distancia',
        text: 'Pero la luz empezó a menguar. Las palabras que no dijimos, las que dijimos de más. La luna empezó a esconderse... y nosotros también.',
        youtubeId: 'JQyOOas-LGU', // Para Siempre - Benjamin Amadeo (User provided)
        image: '/fases/2_new.png',
        startSeconds: 6,
        colorTheme: '#111827', // Gray 900 más oscuro
        particleMode: 'rain'
    },
    {
        id: 3,
        phase: 'quarter',
        phaseEmoji: '🌓',
        phaseName: 'Cuarto',
        title: 'El puente',
        text: 'En la mitad exacta de la noche, alguien decidió construir un puente. Hacia vos. Hacia mí. Hacia lo que podíamos ser.',
        youtubeId: 'UrHDUKMI5DI', // Puente - Gustavo Cerati (User provided)
        image: '/fases/3_new.png',
        startSeconds: 49,
        colorTheme: '#1e1b2e', // Violeta muy oscuro
        particleMode: 'fireflies'
    },
    {
        id: 4,
        phase: 'waxing',
        phaseEmoji: '🌒',
        phaseName: 'Creciente',
        title: 'Juntos de nuevo',
        text: 'Y empezamos a caminar juntos de nuevo. No perfectos. No sin miedo. Pero juntos. Y eso era suficiente.',
        youtubeId: '7hgwPdW9vbA', // Andar Conmigo (User provided)
        image: '/fases/4.png',
        colorTheme: '#0f172a', // Slate 900
        particleMode: 'stars'
    },
    {
        id: 5,
        phase: 'new',
        phaseEmoji: '🌑',
        phaseName: 'Luna Nueva',
        title: 'El nuevo comienzo',
        text: 'Así como la luna llena simboliza el fin de algo, la luna nueva simboliza el comienzo de algo.',
        youtubeId: 'VxKYsiapvFg', // Nunca Te Calmes (User provided)
        image: '/fases/5.png',
        startSeconds: 58,
        colorTheme: 'linear-gradient(to bottom, #0f172a 0%, #2d1b2e 100%)', // Amanecer sutil
        particleMode: 'embers'
    }
];
