import { hackModelsRemoveFirstToken } from "./index";
import { get_encoding, encoding_for_model, type Tiktoken } from "tiktoken";
import { oaiEncodings, oaiModels, openSourceModels } from ".";
import { PreTrainedTokenizer, env } from "@xenova/transformers";
import type { z } from "zod";
import {
  getHuggingfaceSegments,
  getTiktokenSegments,
  type Segment,
} from "~/utils/segments";

export interface TokenizerResult {
  name: string;
  // Array<{ text: string; tokens: { id: number; idx: number }[] }> ?
  tokens: number[];
  segments?: Segment[];
  count: number;
}

export interface TokenInfo {
  id: number;
  text?: string;
  bytes?: Uint8Array;
  // If this is a merge, the original token ids that were merged to form this token
  merge?: [number, number];
  special?: boolean;
}

export interface Tokenizer {
  name: string;
  type: string;
  tokenize(text: string): TokenizerResult;
  getInfo(token: number): TokenInfo;
  specialTokens: Record<string, number>;
  tokenCount: number;
  free?(): void;
}

export class TiktokenTokenizer implements Tokenizer {
  private enc: Tiktoken;
  readonly specialTokens: Record<string, number> = {};
  name: string;
  type = "BPE";
  constructor(model: z.infer<typeof oaiModels> | z.infer<typeof oaiEncodings>) {
    const isModel = oaiModels.safeParse(model);
    const isEncoding = oaiEncodings.safeParse(model);
    console.log(isModel.success, isEncoding.success, model);
    if (isModel.success) {
      if (
        model === "text-embedding-3-small" ||
        model === "text-embedding-3-large"
      ) {
        throw new Error("Model may be too new");
      }

      let specialTokens: Record<string, number> = {};
      let enc;
      if (
        model === "gpt-3.5-turbo" ||
        model === "gpt-4" ||
        model === "gpt-4-32k"
      ) {
        specialTokens = {
          "<|im_start|>": 100264,
          "<|im_end|>": 100265,
          "<|im_sep|>": 100266,
        };
        enc = get_encoding("cl100k_base", specialTokens);
      } else if (model === "gpt-4o") {
        specialTokens = {
          "<|im_start|>": 200264,
          "<|im_end|>": 200265,
          "<|im_sep|>": 200266,
        };
        enc = get_encoding("o200k_base", specialTokens);
      } else {
        // @ts-expect-error r50k broken?
        enc = encoding_for_model(model);
      }
      this.specialTokens = specialTokens;
      this.name = enc.name ?? model;
      this.enc = enc;
    } else if (isEncoding.success) {
      this.enc = get_encoding(isEncoding.data);
      this.name = isEncoding.data;
    } else {
      throw new Error("Invalid model or encoding");
    }
  }

  get tokenCount(): number {
    return this.enc.token_byte_values().length;
  }

  tokenize(text: string): TokenizerResult {
    const tokens = [...(this.enc?.encode(text, "all") ?? [])];
    return {
      name: this.name,
      tokens,
      segments: getTiktokenSegments(this.enc, text),
      count: tokens.length,
    };
  }

  getInfo(token: number): TokenInfo {
    const special = Object.entries(this.specialTokens).find(
      ([_, value]) => value === token
    );
    // Search merges. TODO: how to do this?
    return {
      id: token,
      bytes: this.enc.decode_single_token_bytes(token),
      text: new TextDecoder("utf-8", { fatal: false }).decode(
        this.enc.decode_single_token_bytes(token)
      ),
      special: special !== undefined,
    };
  }

  free(): void {
    this.enc.free();
  }
}

export class OpenSourceTokenizer implements Tokenizer {
  readonly specialTokens: Record<string, number> = {};
  name: string;
  type = "SentencePieceBPE";

  constructor(private tokenizer: PreTrainedTokenizer, name?: string) {
    this.name = name ?? tokenizer.name;
    this.specialTokens = Object.fromEntries(
      tokenizer.added_tokens.map((t) => [t.content, t.id])
    );
  }

  static async load(
    model: z.infer<typeof openSourceModels>
  ): Promise<PreTrainedTokenizer> {
    // use current host as proxy if we're running on the client
    if (typeof window !== "undefined") {
      env.remoteHost = window.location.origin;
    }
    env.remotePathTemplate = "/hf/{model}";
    // Set to false for testing!
    // env.useBrowserCache = false;
    const t = await PreTrainedTokenizer.from_pretrained(model, {
      progress_callback: (progress: any) =>
        console.log(`loading "${model}"`, progress),
    });
    console.log("loaded tokenizer", model, t.name);
    return t;
  }

  tokenize(text: string): TokenizerResult {
    // const tokens = this.tokenizer(text);
    const tokens = this.tokenizer.encode(text);
    const removeFirstToken = (
      hackModelsRemoveFirstToken.options as string[]
    ).includes(this.name);
    return {
      name: this.name,
      tokens,
      segments: getHuggingfaceSegments(this.tokenizer, text, removeFirstToken),
      count: tokens.length,
    };
  }

  get tokenCount(): number {
    return this.tokenizer.model.tokens_to_ids.size;
  }

  getInfo(token: number): TokenInfo {
    const t = this.tokenizer.decode([token]);
    const special = Object.entries(this.specialTokens).find(
      ([_, value]) => value === token
    );
    return {
      id: token,
      bytes: new TextEncoder().encode(t),
      text: t,
      special: special !== undefined,
    };
  }
}

export async function createTokenizer(name: string): Promise<Tokenizer> {
  console.log("createTokenizer", name);
  const oaiEncoding = oaiEncodings.safeParse(name);
  if (oaiEncoding.success) {
    console.log("oaiEncoding", oaiEncoding.data);
    return new TiktokenTokenizer(oaiEncoding.data);
  }
  const oaiModel = oaiModels.safeParse(name);
  if (oaiModel.success) {
    console.log("oaiModel", oaiModel.data);
    return new TiktokenTokenizer(oaiModel.data);
  }

  const ossModel = openSourceModels.safeParse(name);
  if (ossModel.success) {
    console.log("loading tokenizer", ossModel.data);
    const tokenizer = await OpenSourceTokenizer.load(ossModel.data);
    console.log("loaded tokenizer", name);
    return new OpenSourceTokenizer(tokenizer, name);
  }
  throw new Error("Invalid model or encoding");
}
