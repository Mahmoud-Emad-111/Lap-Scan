import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';

const frontendDirectory = fileURLToPath(new URL('.', import.meta.url));
const applicationDirectory = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
    const frontendEnvironment = loadEnv(mode, frontendDirectory, 'VITE_');
    const applicationEnvironment = loadEnv(mode, applicationDirectory, [
        'VITE_',
        'REVERB_HOST',
    ]);
    const configuredFrontendHost =
        process.env.VITE_REVERB_BROWSER_HOST ??
        frontendEnvironment.VITE_REVERB_BROWSER_HOST ??
        process.env.VITE_REVERB_HOST ??
        frontendEnvironment.VITE_REVERB_HOST ??
        applicationEnvironment.VITE_REVERB_BROWSER_HOST ??
        (applicationEnvironment.VITE_REVERB_HOST !==
        applicationEnvironment.REVERB_HOST
            ? applicationEnvironment.VITE_REVERB_HOST
            : undefined);
    const configuredFrontendPort =
        process.env.VITE_REVERB_BROWSER_PORT ??
        frontendEnvironment.VITE_REVERB_BROWSER_PORT ??
        process.env.VITE_REVERB_PORT ??
        frontendEnvironment.VITE_REVERB_PORT ??
        applicationEnvironment.VITE_REVERB_BROWSER_PORT ??
        applicationEnvironment.VITE_REVERB_PORT;
    const publicRuntimeVariables = [
        'VITE_REVERB_APP_KEY',
        'VITE_REVERB_SCHEME',
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'VITE_FIREBASE_VAPID_KEY',
    ];
    const define = Object.fromEntries(
        publicRuntimeVariables.flatMap((name) => {
            const value =
                process.env[name] ??
                frontendEnvironment[name] ??
                applicationEnvironment[name];

            return value === undefined
                ? []
                : [[`import.meta.env.${name}`, JSON.stringify(value)]];
        }),
    );
    if (configuredFrontendHost !== undefined) {
        define['import.meta.env.VITE_REVERB_HOST'] = JSON.stringify(
            configuredFrontendHost,
        );
    }
    if (configuredFrontendPort !== undefined) {
        define['import.meta.env.VITE_REVERB_PORT'] = JSON.stringify(
            configuredFrontendPort,
        );
    }

    return {
        define,
        plugins: lazyPlugins(() => [
            react(),
            babel({
                presets: [reactCompilerPreset()],
            }),
            tailwindcss(),
        ]),
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
        },
        server: {
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
            watch: {
                ignored: [
                    '**/.agents/**',
                    '**/.claude/**',
                    '**/.cursor/**',
                    '**/.junie/**',
                    '**/vendor/**',
                ],
            },
        },
        lint: {
            ignorePatterns: [
                'node_modules/**',
                'dist/**',
                'src/actions/**',
                'src/components/ui/*',
                'src/routes/**',
                'src/wayfinder/**',
            ],
            options: {
                denyWarnings: true,
                typeAware: true,
            },
        },
        fmt: {
            printWidth: 80,
            tabWidth: 4,
            singleQuote: true,
            semi: true,
            singleAttributePerLine: false,
            htmlWhitespaceSensitivity: 'css',
            ignorePatterns: [
                '.github/**',
                'composer.json',
                'src/actions/**',
                'src/components/ui/*',
                'src/routes/**',
                'src/wayfinder/**',
            ],
            sortTailwindcss: {
                functions: ['clsx', 'cn', 'cva'],
                stylesheet: 'src/styles/app.css',
            },
        },
    };
});
