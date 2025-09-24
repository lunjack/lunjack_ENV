// index.d.ts
declare class envLoader {
    constructor(options?: {
        path?: string;
        encoding?: string;
        debug?: boolean;
    });

    getAll(): { [key: string]: string };
    get(key: string, defaultValue?: string | null): string | null;
    has(key: string): boolean;
    load(): { [key: string]: string };
}

declare const env: envLoader & { [key: string]: string };

export default env;