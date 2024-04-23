// import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { tempLlama3HackGetRevision, openSourceModels } from "~/models";

export const config = { runtime: "edge" };

const allowedFiles = z.enum(["tokenizer.json", "tokenizer_config.json"]);

const { HF_API_KEY } = process.env;
if (!HF_API_KEY) {
  throw new Error("Missing HF_API_KEY");
}
// Proxy Eg /models/google/gemma-7b/tokenizer.json -> HF with authorization
const RequestSchema = z.object({
  orgId: z.string(),
  modelId: z.string(),
  file: allowedFiles,
});

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  // Check if the requested model and file a
  const { orgId, modelId, file } = RequestSchema.parse(params);
  // todo: only allow gated models in the future
  const modelName = openSourceModels.parse(`${orgId}/${modelId}`);
  // Proxy request to HuggingFace with an API key that can read the tokenizer.json dict and the tokenizer_config.json
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }
  const rev = tempLlama3HackGetRevision(modelName);
  try {
    // eg https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/tokenizer.json
    const r = await fetch(
      `https://huggingface.co/${orgId}/${modelId}/resolve/${encodeURIComponent(
        rev
      )}/${file}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          ContentType: "application/json",
        },
      }
    );
    return new Response(r.body, {
      status: r.status,
      headers: r.headers,
    });
  } catch (e) {
    console.error(e);
    return new Response("Unable to load model", { status: 500 });
  }
}

export default handler;
