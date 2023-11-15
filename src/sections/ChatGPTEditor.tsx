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

function getChatGPTEncoding(
  messages: { role: string; content: string; name: string }[],
  model: "gpt-3.5-turbo" | "gpt-4-1106-preview" | "gpt-4" | "gpt-4-32k"
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
  model: "gpt-4" | "gpt-4-1106-preview" | "gpt-4-32k" | "gpt-3.5-turbo";
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

              <TextArea
                rows={1}
                value={row.content}
                placeholder="Content"
                onChange={(e) =>
                  setRows((rows) => {
                    const newRows = [...rows];
                    // @ts-expect-error
                    newRows[i].content = e.target.value;
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
