import type { TiktokenEncoding, TiktokenModel } from "tiktoken";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "~/components/Command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/Popover";

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
  "gpt-4-1106-preview",
];

const POPULAR = [
  "gpt-4-1106-preview",
  "gpt-4-32k",
  "gpt-3.5-turbo",
  "text-davinci-003",
  "text-embedding-ada-002",
];

const CHAT_GPT_MODELS = ["gpt-3.5-turbo", "gpt-4", "gpt-4-32k"];

const ENCODERS = ["gpt2", "cl100k_base", "p50k_base", "p50k_edit", "r50k_base"];

export function isEncoder(
  encoder: string | undefined
): encoder is TiktokenEncoding {
  return !!encoder?.includes(encoder as TiktokenEncoding);
}

export function isModel(model: string | undefined): model is TiktokenModel {
  return !!model?.includes(model as TiktokenModel);
}

export type ModelOnly =
  | { model: TiktokenModel }
  | { encoder: TiktokenEncoding };

export function EncoderSelect(props: {
  value: ModelOnly;
  onChange: (value: ModelOnly) => void;
}) {
  const [open, setOpen] = useState(false);
  const serializedValue =
    "encoder" in props.value
      ? `encoder:${props.value.encoder}`
      : "model" in props.value
      ? `model:${props.value.model}`
      : `model:gpt-3.5-turbo`;

  const onSelect = (pair: string) => {
    setOpen(false);
    const [key, value] = pair.split(":");

    if (key === "model" && isModel(value)) {
      return props.onChange({ model: value });
    }

    if (key === "encoder" && isEncoder(value)) {
      return props.onChange({ encoder: value });
    }

    props.onChange({ encoder: "gpt2" as const });
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[300px] justify-between"
          >
            {serializedValue.split(":")[1]}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[70vh] overflow-auto p-0 pb-2">
          <Command>
            <CommandInput placeholder="Search model or encoder..." />
            <CommandEmpty>No model or encoder found.</CommandEmpty>
            <CommandGroup heading="Popular">
              {POPULAR.map((value) => (
                <CommandItem
                  key={value}
                  value={`${
                    ENCODERS.includes(value) ? "encoder" : "model"
                  }:${value}`}
                  onSelect={onSelect}
                >
                  {CHAT_GPT_MODELS.includes(value) ? `${value}` : value}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Encoders">
              {ENCODERS.filter((x) => !POPULAR.includes(x)).map((value) => (
                <CommandItem
                  key={value}
                  value={`encoder:${value}`}
                  onSelect={onSelect}
                >
                  {value}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Models">
              {MODELS.filter((x) => !POPULAR.includes(x)).map((value) => (
                <CommandItem
                  key={value}
                  value={`model:${value}`}
                  onSelect={onSelect}
                >
                  {value}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
