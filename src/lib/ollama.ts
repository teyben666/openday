/**
 * Minimal Ollama client for local vision inference.
 *
 * Used by the application form to read a student's uploaded result slip with
 * MiniCPM-V 4.6 (https://ollama.com/library/minicpm-v4.6).
 *
 * Everything runs on the machine hosting this Next.js app — no data leaves the
 * server, which matters because transcripts are personal data.
 */

export const OLLAMA_BASE_URL = (
  process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
).replace(/\/+$/, '');

export const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'minicpm-v4.6';

const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120_000);
const HEALTH_TIMEOUT_MS = 4_000;

export interface OllamaHealth {
  ok: boolean;
  /** Ollama answered /api/tags */
  reachable: boolean;
  /** The configured vision model is pulled locally */
  modelReady: boolean;
  /**
   * The model actually reports the `vision` capability.
   *
   * `null` means Ollama is too old to expose capabilities, so we can't tell.
   * A text-only model does NOT error when you send it an image — it silently
   * ignores the image and answers from the prompt alone, which looks like a
   * working scan full of invented grades. Checking this is what stops that.
   */
  visionCapable: boolean | null;
  model: string;
  baseUrl: string;
  models: string[];
  /** Vision-capable models that ARE installed, to suggest as alternatives. */
  visionModels?: string[];
  error?: string;
  hint?: string;
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

/** `minicpm-v4.6` should match a pulled `minicpm-v4.6:latest`. */
function modelMatches(installed: string, wanted: string): boolean {
  if (installed === wanted) return true;
  const base = (s: string) => (s.includes(':') ? s.split(':')[0] : s);
  if (base(installed) !== base(wanted)) return false;
  // "minicpm-v4.6" requested -> any tag of that model is fine.
  return !wanted.includes(':') || installed === wanted;
}

/**
 * Ask Ollama what a model can do.
 *
 * Returns `null` when the server is too old to report capabilities — in that
 * case we must not block the scan, only warn.
 */
export async function getModelCapabilities(model: string): Promise<string[] | null> {
  const { signal, done } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
      signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { capabilities?: string[] };
    return Array.isArray(data.capabilities) ? data.capabilities : null;
  } catch {
    return null;
  } finally {
    done();
  }
}

export async function checkOllama(model = OLLAMA_VISION_MODEL): Promise<OllamaHealth> {
  const base: OllamaHealth = {
    ok: false,
    reachable: false,
    modelReady: false,
    visionCapable: null,
    model,
    baseUrl: OLLAMA_BASE_URL,
    models: [],
  };

  const { signal, done } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal, cache: 'no-store' });
    if (!res.ok) {
      return { ...base, error: `Ollama responded ${res.status}` };
    }
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
    const models = (data.models || [])
      .map((m) => m.name || m.model || '')
      .filter(Boolean);

    const modelReady = models.some((m) => modelMatches(m, model));
    if (!modelReady) {
      return {
        ...base,
        reachable: true,
        modelReady: false,
        models,
        ok: false,
        hint: `Run: ollama pull ${model}`,
      };
    }

    // The model is installed — but can it actually see images?
    const caps = await getModelCapabilities(model);
    const visionCapable = caps === null ? null : caps.includes('vision');

    if (visionCapable === false) {
      // Find installed alternatives that can, so the hint is actionable.
      const visionModels: string[] = [];
      for (const m of models) {
        const c = await getModelCapabilities(m);
        if (c?.includes('vision')) visionModels.push(m);
      }
      return {
        ...base,
        reachable: true,
        modelReady: true,
        visionCapable: false,
        models,
        visionModels,
        ok: false,
        error: `Model "${model}" cannot read images`,
        hint: visionModels.length
          ? `Set OLLAMA_VISION_MODEL to one of: ${visionModels.join(', ')}`
          : `Run: ollama pull minicpm-v4.6`,
      };
    }

    return {
      ...base,
      reachable: true,
      modelReady: true,
      visionCapable,
      models,
      ok: true,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      ...base,
      error: aborted ? 'Ollama timed out' : 'Cannot reach Ollama',
      hint: `Start Ollama, then: ollama pull ${model} (expected at ${OLLAMA_BASE_URL})`,
    };
  } finally {
    done();
  }
}

export interface VisionRequest {
  /** Base64 encoded image, WITHOUT the data: prefix. */
  imageBase64: string;
  prompt: string;
  system?: string;
  /** JSON schema passed to Ollama structured outputs. */
  schema?: Record<string, unknown>;
  model?: string;
  numCtx?: number;
  /** Decoding profile; omit to use the default (greedy) profile. */
  sampling?: SamplingProfile;
}

/**
 * Decoding settings.
 *
 * Vision models can fall into a token loop on documents containing long runs of
 * repeated characters — dotted leader lines ("......") between a subject and its
 * grade are a classic trigger on result slips. Ollama aborts the prediction with
 * "token repeat limit reached" when that happens.
 *
 * Greedy decoding (temperature 0) cannot escape such a loop, so each profile
 * below loosens sampling a little more than the last.
 */
export interface SamplingProfile {
  temperature: number;
  /** >1 discourages repetition. Kept mild — grades legitimately repeat. */
  repeatPenalty: number;
  /** How many recent tokens the penalty looks back over. */
  repeatLastN: number;
  /** Hard cap on generated tokens so a runaway can't burn the timeout. */
  numPredict: number;
  seed?: number;
}

/**
 * Escalating profiles, tried in order when a repeat loop is hit.
 *
 * Note the deliberately gentle penalties: a transcript really does contain many
 * identical grades ("A", "A", "A"), and an aggressive repeat penalty makes the
 * model invent different grades to avoid repeating itself — far worse than the
 * loop we're fixing.
 */
export const SAMPLING_PROFILES: SamplingProfile[] = [
  // Deterministic first pass — best accuracy when it works.
  { temperature: 0, repeatPenalty: 1.05, repeatLastN: 64, numPredict: 2048, seed: 1 },
  // Enough randomness to break out of a loop, still near-deterministic.
  { temperature: 0.3, repeatPenalty: 1.12, repeatLastN: 128, numPredict: 2048, seed: 2 },
  // Last resort.
  { temperature: 0.6, repeatPenalty: 1.18, repeatLastN: 256, numPredict: 2048, seed: 3 },
];

export interface VisionResponse {
  content: string;
  model: string;
  tookMs: number;
  evalCount?: number;
  /** Input tokens actually prefilled — reveals silent context truncation. */
  promptEvalCount?: number;
  /** The prompt hit the context ceiling, so the front of it was dropped. */
  contextTruncated?: boolean;
}

export class OllamaError extends Error {
  code:
    | 'unreachable'
    | 'model_missing'
    | 'timeout'
    | 'bad_response'
    /** Model looped on repeated tokens and Ollama aborted the prediction. */
    | 'repeat_loop'
    /** Configured model has no vision capability — it cannot read the upload. */
    | 'not_vision'
    /** Ollama could not load the model into available memory. */
    | 'out_of_memory';
  hint?: string;

  constructor(
    message: string,
    code: OllamaError['code'],
    hint?: string,
  ) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
    this.hint = hint;
  }
}

/** Detect Ollama's "token repeat limit reached" abort in any of its forms. */
export function isRepeatLoopError(text: string): boolean {
  return /token repeat limit|prediction aborted/i.test(text);
}

/**
 * Detect Ollama refusing to load a model because it doesn't fit in RAM/VRAM.
 *
 * This is the classic cause of a slow failure: Ollama spends 30s trying to
 * load the model, then gives up with a 500. Vision models are especially
 * prone to it because the image encoder is loaded on top of the weights.
 */
export function isOutOfMemoryError(text: string): boolean {
  return /more system memory|insufficient memory|out of memory|cudaMalloc|failed to allocate|unable to allocate/i.test(
    text,
  );
}

/**
 * Run a single-image vision chat turn and return the raw assistant text.
 * When `schema` is supplied Ollama constrains decoding to valid JSON.
 */
export async function ollamaVision({
  imageBase64,
  prompt,
  system,
  schema,
  model = OLLAMA_VISION_MODEL,
  /**
   * Context window.
   *
   * Must fit: system prompt (~700 tok) + user prompt (~300) + THE IMAGE + the
   * generated answer. Image cost varies hugely by architecture — MiniCPM-V
   * resamples to ~700 tokens, but tiling models (llava, llama3.2-vision) and
   * dynamic-resolution models (qwen2.5-vl) can spend several thousand on a
   * 1536px page. At 8192 a detailed scan could overflow, and Ollama silently
   * truncates from the FRONT — which deletes the system prompt and leaves the
   * model with an image and no instructions. That produces exactly the kind of
   * prose/garbage reply that ends up as "no subjects could be read".
   */
  numCtx = 16384,
  sampling = SAMPLING_PROFILES[0],
}: VisionRequest): Promise<VisionResponse> {
  const started = Date.now();
  const { signal, done } = withTimeout(TIMEOUT_MS);

  const messages: Record<string, unknown>[] = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt, images: [imageBase64] });

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      cache: 'no-store',
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        ...(schema ? { format: schema } : {}),
        options: {
          temperature: sampling.temperature,
          repeat_penalty: sampling.repeatPenalty,
          repeat_last_n: sampling.repeatLastN,
          num_predict: sampling.numPredict,
          num_ctx: numCtx,
          ...(sampling.seed !== undefined ? { seed: sampling.seed } : {}),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 404) {
        throw new OllamaError(
          `Model "${model}" is not installed`,
          'model_missing',
          `Run: ollama pull ${model}`,
        );
      }
      // Ollama reports the repeat-loop abort as a 500 with this message.
      if (isRepeatLoopError(text)) {
        throw new OllamaError(
          'Model got stuck repeating itself while reading the document',
          'repeat_loop',
          'Retrying with different decoding settings usually fixes this.',
        );
      }
      // Won't fit in memory — typically after a long, slow load attempt.
      if (isOutOfMemoryError(text)) {
        throw new OllamaError(
          `Not enough memory to load "${model}"`,
          'out_of_memory',
          `Free up RAM, or use a smaller model: ollama pull minicpm-v4.6 (1.6GB). Detail: ${text.slice(0, 160)}`,
        );
      }
      throw new OllamaError(
        `Ollama error ${res.status}: ${text.slice(0, 200)}`,
        'bad_response',
        // Surface the raw text — a bare 503 in the browser hides the cause.
        text ? `Ollama said: ${text.slice(0, 200)}` : undefined,
      );
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      eval_count?: number;
      prompt_eval_count?: number;
      error?: string;
      done_reason?: string;
    };

    if (data.error) {
      if (isRepeatLoopError(data.error)) {
        throw new OllamaError(
          'Model got stuck repeating itself while reading the document',
          'repeat_loop',
          'Retrying with different decoding settings usually fixes this.',
        );
      }
      if (isOutOfMemoryError(data.error)) {
        throw new OllamaError(
          `Not enough memory to load "${model}"`,
          'out_of_memory',
          `Free up RAM, or use a smaller model: ollama pull minicpm-v4.6 (1.6GB). Detail: ${data.error.slice(0, 160)}`,
        );
      }
      throw new OllamaError(data.error, 'bad_response');
    }

    // Newer Ollama returns 200 with a done_reason instead of an error body.
    if (data.done_reason && isRepeatLoopError(data.done_reason)) {
      throw new OllamaError(
        'Model got stuck repeating itself while reading the document',
        'repeat_loop',
        'Retrying with different decoding settings usually fixes this.',
      );
    }

    const content = data.message?.content?.trim() || '';
    if (!content) {
      throw new OllamaError('Empty response from model', 'bad_response');
    }

    // Ollama clips an over-long prompt to the window instead of erroring, so a
    // prompt_eval_count sitting right at the ceiling means input was dropped.
    if (data.prompt_eval_count && data.prompt_eval_count >= numCtx - 8) {
      console.warn(
        `[ollama] prompt filled the ${numCtx}-token context ` +
          `(prompt_eval_count=${data.prompt_eval_count}). The system prompt was ` +
          `probably truncated — raise numCtx or lower the image resolution.`,
      );
    }

    return {
      content,
      model,
      tookMs: Date.now() - started,
      evalCount: data.eval_count,
      promptEvalCount: data.prompt_eval_count,
      /** True when the input hit the context ceiling and was clipped. */
      contextTruncated: Boolean(
        data.prompt_eval_count && data.prompt_eval_count >= numCtx - 8,
      ),
    };
  } catch (error) {
    if (error instanceof OllamaError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OllamaError(
        `Model timed out after ${Math.round(TIMEOUT_MS / 1000)}s`,
        'timeout',
        'First run is slow while the model loads into memory. Try again.',
      );
    }
    throw new OllamaError(
      `Cannot reach Ollama at ${OLLAMA_BASE_URL}`,
      'unreachable',
      'Is `ollama serve` running?',
    );
  } finally {
    done();
  }
}

/** Tolerant JSON parse — models sometimes wrap output in prose or fences. */
export function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // fall through
  }

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      // fall through to salvage
    }
  }

  // Last resort: the reply was cut off mid-array (hit num_predict, or the
  // model just stopped). Rather than lose a whole page of grades, recover
  // every COMPLETE {"subject": ..., "grade": ...} object that did arrive.
  const salvaged = salvageSubjects(cleaned);
  return salvaged ? (salvaged as T) : null;
}

/**
 * Pull complete subject/grade pairs out of a truncated JSON reply.
 *
 * Only whole objects are taken — a half-written row is dropped rather than
 * guessed at, so this can never invent a grade.
 */
function salvageSubjects(text: string): { subjects: { subject: string; grade: string }[] } | null {
  const pairs: { subject: string; grade: string }[] = [];
  const re =
    /\{\s*"subject"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"grade"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    try {
      pairs.push({ subject: JSON.parse(`"${m[1]}"`), grade: JSON.parse(`"${m[2]}"`) });
    } catch {
      // Skip anything with broken escaping.
    }
  }

  return pairs.length ? { subjects: pairs } : null;
}
