import { type Tiktoken } from "tiktoken";
import Graphemer from "graphemer";
import { type PreTrainedTokenizer } from "@xenova/transformers";

const textDecoder = new TextDecoder();
const graphemer = new Graphemer();

export type Segment = {
  text: string;
  tokens: { id: number; idx: number }[];
};

export function getTiktokenSegments(
  encoder: Tiktoken,
  inputText: string
): Segment[] {
  const tokens = encoder.encode(inputText, "all");
  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let byteAcc: number[] = [];
  let tokenAcc: { id: number; idx: number }[] = [];
  let inputGraphemes = graphemer.splitGraphemes(inputText);

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx]!;
    byteAcc.push(...encoder.decode_single_token_bytes(token));
    tokenAcc.push({ id: token, idx });

    const segmentText = textDecoder.decode(new Uint8Array(byteAcc));
    const graphemes = graphemer.splitGraphemes(segmentText);

    if (graphemes.every((item, idx) => inputGraphemes[idx] === item)) {
      segments.push({ text: segmentText, tokens: tokenAcc });

      byteAcc = [];
      tokenAcc = [];
      inputGraphemes = inputGraphemes.slice(graphemes.length);
    }
  }

  return segments;
}

export function getHuggingfaceSegments(
  tokenizer: PreTrainedTokenizer,
  inputText: string
): Segment[] {
  const tokens = tokenizer.encode(inputText);
  // remove first token, which is always <s>?
  tokens.shift();

  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let inputGraphemes = graphemer.splitGraphemes(inputText);
  const tokenStrs = tokenizer.model.convert_ids_to_tokens(tokens);

  let startTokenIdx = 0;
  let tokenAcc: { id: number; idx: number }[] = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    tokenAcc.push({ id: tokens[idx]!, idx });

    const prev = tokenizer.decoder(tokenStrs.slice(0, startTokenIdx + 1));
    const curr = tokenizer.decoder(tokenStrs.slice(0, idx + 1));

    const segmentText = prev === curr ? curr : curr.slice(prev.length);
    const graphemes = graphemer.splitGraphemes(segmentText);

    if (graphemes.every((item, idx) => inputGraphemes[idx] === item)) {
      segments.push({ text: segmentText, tokens: tokenAcc });

      tokenAcc = [];
      startTokenIdx = idx;
      inputGraphemes = inputGraphemes.slice(graphemes.length);
    }
  }

  return segments;
}
