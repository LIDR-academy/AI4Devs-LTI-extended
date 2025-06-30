export class Logger {
    static info(message: string, ...args: any[]) {
        console.log(`[INFO] ${message}`, ...args);
    }

    static error(message: string, ...args: any[]) {
        console.error(`[ERROR] ${message}`, ...args);
    }

    static warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${message}`, ...args);
    }
} 