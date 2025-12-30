/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ElectronAPI {
    getRunHistory: () => Promise<any[]>;
    clearRunHistory: () => Promise<boolean>;
    getWorkflows: () => Promise<any[]>;
    saveWorkflow: (workflow: any) => Promise<{ status: string }>;
    deleteWorkflow: (id: string) => Promise<{ status: string }>;
    planWorkflow: (command: string) => Promise<{ status: string; workflow?: any; message?: string }>;
    getPreferences: () => Promise<{ apiKey: string; defaultBrowser: string }>;
    savePreferences: (prefs: { apiKey: string; defaultBrowser: string }) => Promise<{ status: string }>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
        ipcRenderer: {
            send: (channel: string, ...args: any[]) => void;
            on: (channel: string, func: (...args: any[]) => void) => void;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            removeAllListeners: (channel: string) => void;
        };
    }
}
