// @ts-expect-error
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import model from "tiktoken/encoders/cl100k_base.json";
import { init, Tiktoken } from "tiktoken/lite/init";

export const config = { runtime: "edge" };

async function handler(req: Request) {
  await init((imports) => WebAssembly.instantiate(wasm, imports));

  const encoding = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );

  const tokens = encoding.encode("hello world");
  encoding.free();

  return new Response(`${tokens}`);
}

export default handler;
