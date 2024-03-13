import { type Tiktoken } from "tiktoken";
import Graphemer from "graphemer";
import { PreTrainedTokenizer } from "@xenova/transformers";

const textDecoder = new TextDecoder();
const graphemer = new Graphemer();

export type Segment = {
  text: string;
  tokens: {
    id: number;
    idx: number;
  }[];
};

export function getTiktokenSegments(
  encoder: Tiktoken,
  inputText: string
): Segment[] {
  const encoding = encoder.encode(inputText, "all");
  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let byteAcc: number[] = [];
  let tokenAcc: { id: number; idx: number }[] = [];
  let inputGraphemes = graphemer.splitGraphemes(inputText);

  for (let idx = 0; idx < encoding.length; idx++) {
    const token = encoding[idx]!;
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
  const encoding = tokenizer.encode(inputText);
  const te = new TextEncoder();
  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let byteAcc: number[] = [];
  let tokenAcc: { id: number; idx: number }[] = [];
  let inputGraphemes = graphemer.splitGraphemes(inputText);

  for (let idx = 0; idx < encoding.length; idx++) {
    const token = encoding[idx]!;
    const single = tokenizer.decode_single([token], {
      clean_up_tokenization_spaces: false,
      skip_special_tokens: false,
    });
    byteAcc.push(...te.encode(single));
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
