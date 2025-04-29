import { z } from "zod";

export const provider = z.enum(["openai", "anthropic", "open-source"]);

export const oaiEncodings = z.enum([
  "gpt2",
  "r50k_base",
  "p50k_base",
  "p50k_edit",
  "cl100k_base",
  "o200k_base",
]);

export const chatModels = z.enum([
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-3.5-turbo",
  "gpt-4",
  "gpt-4-32k",
  "gpt-4-1106-preview",
]);

export const legacyTextModels = z.enum([
  "text-davinci-003",
  "text-davinci-002",
  "text-davinci-001",
  "text-curie-001",
  "text-babbage-001",
  "text-ada-001",
  "davinci",
  "curie",
  "babbage",
  "ada",
  "code-davinci-002",
  "code-davinci-001",
  "code-cushman-002",
  "code-cushman-001",
  "davinci-codex",
  "cushman-codex",
  "text-davinci-edit-001",
  "code-davinci-edit-001",
]);

export const embeddingModels = z.enum([
  "text-embedding-ada-002",
  "text-embedding-3-small",
  "text-embedding-3-large",
]);

export const legacyEmbeddingModels = z.enum([
  "text-similarity-davinci-001",
  "text-similarity-curie-001",
  "text-similarity-babbage-001",
  "text-similarity-ada-001",
  "text-search-davinci-doc-001",
  "text-search-curie-doc-001",
  "text-search-babbage-doc-001",
  "text-search-ada-doc-001",
  "code-search-babbage-code-001",
  "code-search-ada-code-001",
]);

export const oaiModels = z.enum([
  ...chatModels.options,
  ...legacyTextModels.options,
  ...legacyEmbeddingModels.options,
  ...embeddingModels.options,
]);

export const openSourceModels = z.enum([
  // "meta-llama/Llama-2-7b-hf",
  "codellama/CodeLlama-7b-hf",
  "codellama/CodeLlama-70b-hf",
  "meta-llama/Meta-Llama-3-8B",
  "meta-llama/Meta-Llama-3-70B",
  "microsoft/phi-2",
  "google/gemma-7b",
  "deepseek-ai/DeepSeek-R1",
  "Qwen/Qwen2.5-72B",
  // "mistralai/Mistral-7B-v0.1",
  "tiiuae/falcon-7b",
  "01-ai/Yi-6B",
  "openai/whisper-tiny",
]);

export function tempLlama3HackGetRevision(model: AllModels): string {
  if (model === "meta-llama/Meta-Llama-3-8B") {
    return "refs/pr/35";
  } else if (model === "meta-llama/Meta-Llama-3-70B") {
    return "refs/pr/5";
  } else {
    return "main";
  }
}

export const hackModelsRemoveFirstToken = z.enum([
  "meta-llama/Llama-2-7b-hf",
  "codellama/CodeLlama-7b-hf",
  "codellama/CodeLlama-70b-hf",
]);

export const allModels = z.enum([
  ...oaiModels.options,
  ...openSourceModels.options,
]);

export type AllModels = z.infer<typeof allModels>;

export const allOptions = z.enum([
  ...allModels.options,
  ...oaiEncodings.options,
]);

export type AllOptions = z.infer<typeof allOptions>;

export const MODELS = allModels.options;

export const POPULAR: z.infer<typeof allOptions>[] = [
  "cl100k_base",
  "o200k_base",
  "gpt-4-1106-preview",
  "gpt-3.5-turbo",
  "codellama/CodeLlama-7b-hf",
];

export function isChatModel(
  model: AllOptions
): model is z.infer<typeof chatModels> {
  return (
    model === "gpt-3.5-turbo" ||
    model === "gpt-4o" ||
    model === "gpt-4o-mini" ||
    model === "gpt-4" ||
    model === "gpt-4-1106-preview" ||
    model === "gpt-4-32k"
  );
}

export function isValidOption(model: unknown): model is AllOptions {
  return allOptions.safeParse(model).success;
}
