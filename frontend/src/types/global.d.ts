declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare global {
    interface ImportMetaEnv {
        readonly VITE_REVERB_APP_KEY?: string;
        readonly VITE_REVERB_HOST?: string;
        readonly VITE_REVERB_PORT?: string;
        readonly VITE_REVERB_SCHEME?: string;
        readonly VITE_FIREBASE_API_KEY?: string;
        readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
        readonly VITE_FIREBASE_PROJECT_ID?: string;
        readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
        readonly VITE_FIREBASE_APP_ID?: string;
        readonly VITE_FIREBASE_VAPID_KEY?: string;
    }
}

export {};
