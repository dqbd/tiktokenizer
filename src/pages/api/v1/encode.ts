import type { NextApiRequest, NextApiResponse } from "next";

import { z } from "zod";
import { type AllOptions, oaiEncodings, allModels } from "~/models";
import { createTokenizer } from "~/models/tokenizer";

async function encode(model: AllOptions, text: string): Promise<ResponseType> {
  const enc = await createTokenizer(model);
  const r = enc.tokenize(text);
  return {
    name: r.name,
    tokens: r.tokens,
    count: r.count,
  };
}

const encoderSchema = z.object({
  text: z.string(),
  encoder: oaiEncodings,
});

const modelSchema = z.object({
  text: z.string(),
  model: allModels,
});

const requestSchema = z.union([encoderSchema, modelSchema]);

const responseSchema = z.object({
  name: z.string().optional(),
  tokens: z.number().array(),
  // tokens: tokenSchema.array(),
  count: z.number(),
});

type ResponseType = z.infer<typeof responseSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data =
    typeof req.body === "object" ? { ...req.body, ...req.query } : req.query;
  const input = requestSchema.parse(data);

  let result: ResponseType | undefined;
  if ("encoder" in input) {
    result = await encode(input.encoder, input.text);
  } else {
    result = await encode(input.model, input.text);
  }
  if (!result) {
    return res.status(400).json({ error: "Could not encode result" });
  }

  res.json(result);
}
