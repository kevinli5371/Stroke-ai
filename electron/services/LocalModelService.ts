/**
 * LocalModelService — wraps node-llama-cpp (v3) to run Phi-3.5 Mini locally.
 *
 * The package is loaded lazily via dynamic import so the rest of the app
 * still works even if node-llama-cpp is not installed or fails to load.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let llamaModule: any = null;

async function loadLlamaModule() {
  if (!llamaModule) {
    llamaModule = await import('node-llama-cpp');
  }
  return llamaModule;
}

export class LocalModelService {
  private llama: any = null;
  private model: any = null;
  private _initializing = false;

  /**
   * Load the GGUF model into memory. Takes ~5-10 s the first time.
   * Context is created per-generation in generate(), so we don't keep one here.
   */
  async initialize(modelPath: string): Promise<void> {
    if (this.model) return; // already loaded

    // Guard against concurrent init calls
    if (this._initializing) {
      while (this._initializing) {
        await new Promise((r) => setTimeout(r, 200));
      }
      return;
    }

    this._initializing = true;
    try {
      const { getLlama } = await loadLlamaModule();
      this.llama = await getLlama();
      this.model = await this.llama.loadModel({ modelPath });
      console.log('[LocalModel] Model loaded successfully');
    } catch (err) {
      console.error('[LocalModel] Failed to initialize:', err);
      this.model = null;
      this.llama = null;
      throw err;
    } finally {
      this._initializing = false;
    }
  }

  isInitialized(): boolean {
    return this.model !== null;
  }

  /**
   * Generate text with the local model.
   *
   * We dispose the old context and create a fresh one for each call.
   * This guarantees no leftover state from the previous generation
   * and avoids accumulating sequences that eat into the finite context.
   */
  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.model) {
      throw new Error('Local model not initialized. Download & load it first.');
    }

    const { LlamaChatSession } = await loadLlamaModule();

    // Create a throwaway context + sequence for this single generation
    // so there is zero cross-request bleed and no sequence accumulation.
    const ctx = await this.model.createContext({
      contextSize: 4096,
      sequences: 1,
    });

    const session = new LlamaChatSession({
      contextSequence: ctx.getSequence(),
      systemPrompt,
    });

    try {
      const response: string = await session.prompt(userMessage, {
        maxTokens: 2048,
        temperature: 0.2,
      });
      return response;
    } finally {
      // Clean up to free memory immediately
      try { session.dispose?.(); } catch { /* best-effort */ }
      try { await ctx.dispose(); } catch { /* best-effort */ }
    }
  }

  /** Release all resources. */
  async dispose(): Promise<void> {
    try {
      await this.model?.dispose();
    } catch { /* ignore */ }
    this.model = null;
    this.llama = null;
    console.log('[LocalModel] Disposed');
  }
}
