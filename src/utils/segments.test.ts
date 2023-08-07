import { it, expect } from "vitest";
import { getSegments } from "./segments";
import { get_encoding } from "tiktoken";

it("segments equality test", () => {
  const encoder = get_encoding("cl100k_base");
  const textDecoder = new TextDecoder();

  const fixtures = [
    "Hello world",
    "New lines\n\n\n\n\n       Spaces",
    "👩‍👦‍👦 👩‍👧‍👦 👩‍👧‍👧 👩‍👩‍👦 👩‍👩‍👧 🇨🇿 Emojis: 🧑🏾‍💻️🧑🏿‍🎓️🧑🏿‍🏭️🧑🏿‍💻️",
    "是美國一個人工智能研究實驗室 由非營利組織OpenAI Inc",
    "<|im_start|>test<|im_end|>",
  ];

  for (const fixture of fixtures) {
    const segments = getSegments(encoder, fixture);
    const tokens = encoder.encode(fixture, "all");

    expect(segments.map((i) => i.text).join("")).toEqual(
      textDecoder.decode(encoder.decode(tokens))
    );

    expect(segments.map((i) => i.tokens.map((i) => i.id)).flat(1)).toEqual([
      ...tokens,
    ]);

    expect(segments.map((i) => i.tokens.map((i) => i.idx)).flat(1)).toEqual(
      Array(tokens.length)
        .fill(0)
        .map((_, i) => i)
    );
  }

  encoder.free();
});

it("segments grapheme test", () => {
  const fixtures = {
    "👩‍👦‍👦 👩‍👧‍👦 👩‍👧‍👧 👩‍👩‍👦 👩‍👩‍👧 🇨🇿": ["👩‍👦‍👦", " 👩‍👧‍👦", " 👩‍👧‍👧", " 👩‍👩‍👦", " 👩‍👩‍👧", " 🇨🇿"],
    由非營利組織: ["由", "非", "營", "利", "組", "織"],
  };

  const encoder = get_encoding("cl100k_base");

  for (const [input, output] of Object.entries(fixtures)) {
    const segments = getSegments(encoder, input);
    expect(segments.map((i) => i.text)).toEqual(output);
  }
});
