export interface logs {
    debug: (message: string | number | boolean | object | symbol) => void;
    log: (message: string | number | boolean | object | symbol) => void;
    info: (message: string | number | boolean | object | symbol) => void;
    warn: (message: string | number | boolean | object | symbol) => void;
    error: (message: string | number | boolean | object | symbol) => void; 
}

export type logsType = keyof logs;

export type errorType = string | number | boolean | object | symbol;