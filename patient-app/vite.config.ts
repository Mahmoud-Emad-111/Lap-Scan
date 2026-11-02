import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const firebaseVariables = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'VITE_FIREBASE_VAPID_KEY',
    ] as const;

    return {
        plugins: [
            react(),
            {
                name: 'patient-firebase-service-worker',
                configureServer(server) {
                    server.middlewares.use((request, response, next) => {
                        if (request.url !== '/firebase-messaging-sw.dev.js') {
                            next();
                            return;
                        }

                        response.setHeader('Content-Type', 'text/javascript');
                        response.end("import '/src/firebase-messaging-sw.ts';");
                    });
                },
            },
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host: '127.0.0.1',
            port: 5174,
            strictPort: true,
        },
        define: {
            'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
                process.env.VITE_API_BASE_URL ?? env.VITE_API_BASE_URL ?? '',
            ),
            'import.meta.env.VITE_REVERB_APP_KEY': JSON.stringify(
                process.env.VITE_REVERB_APP_KEY ?? env.VITE_REVERB_APP_KEY ?? '',
            ),
            ...Object.fromEntries(
                firebaseVariables.map((key) => [
                    `import.meta.env.${key}`,
                    JSON.stringify(process.env[key] || env[key] || ''),
                ]),
            ),
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    index: fileURLToPath(new URL('./index.html', import.meta.url)),
                    firebaseMessagingSw: fileURLToPath(new URL('./src/firebase-messaging-sw.ts', import.meta.url)),
                },
                output: {
                    entryFileNames: (chunk) => chunk.name === 'firebaseMessagingSw'
                        ? 'firebase-messaging-sw.js'
                        : 'assets/[name]-[hash].js',
                },
            },
        },
    };
});
