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
import {
  AllOptions,
  POPULAR,
  allModels,
  allOptions,
  chatModels,
  isValidOption,
  oaiEncodings,
} from "~/models";

export function EncoderSelect(props: {
  value: AllOptions;
  onChange: (value: AllOptions) => void;
}) {
  const [open, setOpen] = useState(false);
  const { value } = props;

  const onSelect = (v: string) => {
    setOpen(false);
    if (isValidOption(v)) {
      props.onChange(v);
    } else {
      console.error("Invalid option", v, allOptions.options);
    }
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
            {value}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[70vh] overflow-auto p-0 pb-2">
          <Command>
            <CommandInput placeholder="Search model or encoder..." />
            <CommandEmpty>No model or encoder found.</CommandEmpty>
            <CommandGroup heading="Popular">
              {POPULAR.map((value) => (
                <CommandItem key={value} value={value} onSelect={onSelect}>
                  {value}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Encoders">
              {oaiEncodings.options
                .filter((x) => !POPULAR.includes(x))
                .map((value) => (
                  <CommandItem key={value} value={value} onSelect={onSelect}>
                    {value}
                  </CommandItem>
                ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Models">
              {allModels.options
                .filter((x) => !POPULAR.includes(x))
                .map((value) => (
                  <CommandItem
                    key={value as unknown as string}
                    value={value}
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
