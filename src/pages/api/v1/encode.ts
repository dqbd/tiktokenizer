import type { NextApiRequest, NextApiResponse } from "next";

import { encoding_for_model, get_encoding } from "tiktoken";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = z
    .union([
      z.object({
        text: z.string(),
        encoder: z.union([
          z.literal("gpt2"),
          z.literal("r50k_base"),
          z.literal("p50k_base"),
          z.literal("p50k_edit"),
          z.literal("cl100k_base"),
        ]),
      }),
      z.object({
        text: z.string(),
        model: z.union([
          z.literal("gpt-3.5-turbo"),
          z.literal("gpt-4"),
          z.literal("gpt-4-32k"),
          z.literal("text-davinci-003"),
          z.literal("text-davinci-002"),
          z.literal("text-davinci-001"),
          z.literal("text-curie-001"),
          z.literal("text-babbage-001"),
          z.literal("text-ada-001"),
          z.literal("davinci"),
          z.literal("curie"),
          z.literal("babbage"),
          z.literal("ada"),
          z.literal("code-davinci-002"),
          z.literal("code-davinci-001"),
          z.literal("code-cushman-002"),
          z.literal("code-cushman-001"),
          z.literal("davinci-codex"),
          z.literal("cushman-codex"),
          z.literal("text-davinci-edit-001"),
          z.literal("code-davinci-edit-001"),
          z.literal("text-embedding-ada-002"),
          z.literal("text-similarity-davinci-001"),
          z.literal("text-similarity-curie-001"),
          z.literal("text-similarity-babbage-001"),
          z.literal("text-similarity-ada-001"),
          z.literal("text-search-davinci-doc-001"),
          z.literal("text-search-curie-doc-001"),
          z.literal("text-search-babbage-doc-001"),
          z.literal("text-search-ada-doc-001"),
          z.literal("code-search-babbage-code-001"),
          z.literal("code-search-ada-code-001"),
          z.literal("gpt2"),
        ]),
      }),
    ])
    .parse(
      typeof req.body === "object" ? { ...req.body, ...req.query } : req.query
    );

  const enc =
    "encoder" in input
      ? get_encoding(input.encoder)
      : "model" in input
      ? input.model === "gpt-3.5-turbo" ||
        input.model === "gpt-4" ||
        input.model === "gpt-4-32k"
        ? get_encoding("cl100k_base", {
            "<|im_start|>": 100264,
            "<|im_end|>": 100265,
            "<|im_sep|>": 100266,
            // TODO: very hacky
            // "system name=": 900000,
            // "assistant name=": 900001,
            // "user name=": 900002,
          })
        : encoding_for_model(input.model)
      : undefined;

  const tokens = [...(enc?.encode(input.text, "all") ?? [])];
  res.json({
    name: enc?.name,
    tokens,
    count: tokens.length,
  });
}
