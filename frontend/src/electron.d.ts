export interface ElectronAPI {
    getRunHistory: () => Promise<any[]>;
    clearRunHistory: () => Promise<boolean>;
    getWorkflows: () => Promise<any[]>;
    saveWorkflow: (workflow: any) => Promise<{ status: string }>;
    deleteWorkflow: (id: string) => Promise<{ status: string }>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
        ipcRenderer: {
            send: (channel: string, ...args: any[]) => void;
            on: (channel: string, func: (...args: any[]) => void) => void;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
        };
    }
}
