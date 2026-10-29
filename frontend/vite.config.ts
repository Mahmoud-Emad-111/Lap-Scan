import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
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
});
