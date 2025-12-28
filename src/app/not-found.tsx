export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400">Página no encontrada</p>
                <a href="/" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300">
                    ← Volver al inicio
                </a>
            </div>
        </div>
    );
}
