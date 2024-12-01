import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/Select";
import { X as Close } from "lucide-react";
import { Button } from "~/components/Button";
import { Input, TextArea } from "~/components/Input";
import { cn } from "~/utils/cn";

const TEXT_COMMON_STYLE = cn(
  "col-[1] row-[1]",
  "flex h-full w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm leading-[22px]"
);

function AutosizingTextArea(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid grid-cols-1">
      <TextArea
        rows={1}
        placeholder="Content"
        className={cn(
          "resize-none",
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900",
          TEXT_COMMON_STYLE
        )}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      <div
        className={cn("whitespace-pre-wrap opacity-0", TEXT_COMMON_STYLE)}
        style={{ visibility: "hidden" }}
      >
        {props.value || props.placeholder}{" "}
      </div>
    </div>
  );
}

function getChatGPTEncoding(
  messages: { role: string; content: string; name: string }[],
  model:
    | "gpt-3.5-turbo"
    | "gpt-4-1106-preview"
    | "gpt-4"
    | "gpt-4o"
    | "gpt-4o-mini"
    | "gpt-4-32k"
) {
  const isGpt3 = model === "gpt-3.5-turbo";

  const msgSep = isGpt3 ? "\n" : "";
  const roleSep = isGpt3 ? "\n" : "<|im_sep|>";

  return [
    messages
      .map(({ name, role, content }) => {
        return `<|im_start|>${name || role}${roleSep}${content}<|im_end|>`;
      })
      .join(msgSep),
    `<|im_start|>assistant${roleSep}`,
  ].join(msgSep);
}

export function ChatGPTEditor(props: {
  model:
    | "gpt-4"
    | "gpt-4-1106-preview"
    | "gpt-4-32k"
    | "gpt-4o"
    | "gpt-4o-mini"
    | "gpt-3.5-turbo";
  onChange: (value: string) => void;
}) {
  const [rows, setRows] = useState<
    { role: string; content: string; name: string }[]
  >([
    { role: "system", content: "You are a helpful assistant", name: "" },
    { role: "user", content: "", name: "" },
  ]);

  const changeRef = useRef<(value: string) => void>(props.onChange);

  // not ideal, but will suffice for now
  useEffect(() => void (changeRef.current = props.onChange), [props.onChange]);
  useEffect(() => {
    changeRef.current?.(getChatGPTEncoding(rows, props.model));
  }, [props.model, rows]);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div className="flex flex-col gap-2" key={i}>
          <div className="grid grid-cols-[min-content,1fr,auto] gap-2">
            <Select
              value={row.role}
              onValueChange={(val) =>
                setRows((rows) => {
                  const newRows = [...rows];
                  // @ts-expect-error
                  newRows[i].role = val;
                  return newRows;
                })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectSeparator />
                <SelectItem value="system-name">Custom</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              {row.role === "system-name" && (
                <Input
                  value={row.name}
                  placeholder="Name"
                  onChange={(e) =>
                    setRows((rows) => {
                      const newRows = [...rows];
                      // @ts-expect-error
                      newRows[i].name = e.target.value;
                      return newRows;
                    })
                  }
                />
              )}

              <AutosizingTextArea
                value={row.content}
                placeholder="Content"
                onChange={(value) =>
                  setRows((rows) => {
                    const newRows = [...rows];
                    // @ts-expect-error
                    newRows[i].content = value;
                    return newRows;
                  })
                }
              />
            </div>

            <Button
              variant="subtle"
              className="p-2"
              onClick={() => {
                setRows((rows) => {
                  const newRows = [...rows];
                  newRows.splice(i, 1);
                  return newRows;
                });
              }}
            >
              <Close />
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={() =>
          setRows((rows) => {
            let role = "user";

            if (rows.length === 0) {
              role = "system";
            } else if (rows.at(-1)?.role === "user") {
              role = "assistant";
            }

            return [...rows, { role, content: "", name: "" }];
          })
        }
      >
        Add message
      </Button>
    </div>
  );
}
