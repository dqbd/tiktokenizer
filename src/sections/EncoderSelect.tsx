import type { TiktokenEncoding, TiktokenModel } from "@dqbd/tiktoken";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/Select";

const MODELS = [
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
  "text-embedding-ada-002",
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
  "gpt2",
  "gpt-4",
  "gpt-4-32k",
  "gpt-3.5-turbo",
];

const POPULAR = [
  "gpt-4",
  "gpt-4-32k",
  "gpt-3.5-turbo",
  "text-davinci-003",
  "text-embedding-ada-002",
];

const CHAT_GPT_MODELS = ["gpt-3.5-turbo"];

const ENCODERS = ["gpt2", "cl100k_base", "p50k_base", "p50k_edit", "r50k_base"];

function isEncoder(encoder: string | undefined): encoder is TiktokenEncoding {
  return !!encoder?.includes(encoder as TiktokenEncoding);
}

function isModel(model: string | undefined): model is TiktokenModel {
  return !!model?.includes(model as TiktokenModel);
}

type ModelOnly = { model: TiktokenModel } | { encoder: TiktokenEncoding };

export function EncoderSelect(props: {
  value: ModelOnly;
  onChange: (value: ModelOnly) => void;
}) {
  const serializedValue =
    "encoder" in props.value
      ? `encoder:${props.value.encoder}`
      : "model" in props.value
      ? `model:${props.value.model}`
      : `model:gpt-3.5-turbo`;

  return (
    <Select
      value={serializedValue}
      onValueChange={(pair) => {
        const [key, value] = pair.split(":");

        if (key === "model" && isModel(value)) {
          return props.onChange({ model: value });
        }

        if (key === "encoder" && isEncoder(value)) {
          return props.onChange({ encoder: value });
        }

        return props.onChange({ encoder: "gpt2" as const });
      }}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Model or Encoder" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Popular</SelectLabel>
          {POPULAR.map((value) => (
            <SelectItem
              value={`${
                ENCODERS.includes(value) ? "encoder" : "model"
              }:${value}`}
              key={value}
            >
              {CHAT_GPT_MODELS.includes(value) ? `${value} (ChatGPT)` : value}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Encoders</SelectLabel>
          {ENCODERS.filter((x) => !POPULAR.includes(x)).map((value) => (
            <SelectItem value={`encoder:${value}`} key={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          {MODELS.filter((x) => !POPULAR.includes(x)).map((value) => (
            <SelectItem value={`model:${value}`} key={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
