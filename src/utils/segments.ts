import { type Tiktoken } from "tiktoken";
import Graphemer from "graphemer";
import { type PreTrainedTokenizer } from "@xenova/transformers";

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
  console.log("HF tokens", tokens);
  const te = new TextEncoder();
  const segments: { text: string; tokens: { id: number; idx: number }[] }[] =
    [];

  let byteAcc: number[] = [];
  let tokenAcc: { id: number; idx: number }[] = [];
  let inputGraphemes = graphemer.splitGraphemes(inputText);

  const tokenStrs = tokenizer.model.convert_ids_to_tokens(tokens);
  const dec = tokenizer.decoder ?? ((x: string) => x);
  console.log("decoder", dec, dec.config);
  return tokenStrs.map((token, idx) => ({
    // This is extremely dumb and I hate it. Oh, sentencepiece!
    text: idx == 0 ? dec([token]) : dec([" ", token]),
    tokens: [{ id: tokens[idx]!, idx }],
  }));

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx]!;
    const single = tokenizer.decode_single([token], {
      clean_up_tokenization_spaces: false,
      skip_special_tokens: false,
    });
    console.log("HF single", single);
    byteAcc.push(...te.encode(single));
    tokenAcc.push({ id: token, idx });

    // const segmentText = textDecoder.decode(new Uint8Array(byteAcc));
    // const graphemes = graphemer.splitGraphemes(segmentText);
    const graphemes = graphemer.splitGraphemes(single);
    console.log("HF graphemes", graphemes, "input", inputGraphemes);

    if (graphemes.every((item, idx) => inputGraphemes[idx] === item)) {
      segments.push({ text: single, tokens: tokenAcc });

      byteAcc = [];
      tokenAcc = [];
      inputGraphemes = inputGraphemes.slice(graphemes.length);
    } else {
      console.log("HF mismatch", graphemes, inputGraphemes);
      segments.push({ text: single, tokens: tokenAcc });
      byteAcc = [];
      tokenAcc = [];
      inputGraphemes = inputGraphemes.slice(graphemes.length);
    }
  }

  return segments;
}
