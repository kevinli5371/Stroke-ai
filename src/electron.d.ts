export interface ElectronAPI {
    // Workflow Management
    saveWorkflow: (workflow: any) => Promise<any>
    getWorkflows: () => Promise<any[]>
    deleteWorkflow: (id: string) => Promise<any>
    planWorkflow: (command: string) => Promise<any>

    // Run History
    getRunHistory: () => Promise<any[]>
    clearRunHistory: () => Promise<void>

    // Preferences
    getPreferences: () => Promise<any>
    savePreferences: (prefs: any) => Promise<any>

    // Local Model Management
    modelCheckDownloaded: () => Promise<boolean>
    modelDownload: () => Promise<{ status: string; path?: string; message?: string }>
    modelCancelDownload: () => Promise<{ status: string }>
    modelDelete: () => Promise<{ status: string }>
    modelStatus: () => Promise<{ downloaded: boolean; initialized: boolean; sizeBytes: number }>
}

declare global {
    interface Window {
        electron: ElectronAPI
        ipcRenderer: {
            on: (channel: string, func: (...args: any[]) => void) => void
            removeAllListeners: (channel: string) => void
        }
    }
}
