import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import {
  EditorContent,
  Extension,
  useEditor,
  type JSONContent,
} from "@tiptap/react";
import { useEffect, useMemo } from "react";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { type Node } from "@tiptap/pm/model";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import Graphemer from "graphemer";
import { cn } from "~/utils/cn";
import { type UserModelChoice, getUserSelectedEncoder } from "~/utils/model";

const COLORS = [
  "bg-sky-200",
  "bg-amber-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-gray-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-lime-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-yellow-200",
  "bg-emerald-200",
  "bg-zinc-200",
  "bg-red-200",
  "bg-fuchsia-200",
  "bg-pink-200",
  "bg-teal-200",
];

function convertTextToJSONContent(content: string | null | undefined) {
  if (content == null) return [];
  const lines = content.split("\n");
  return lines.map(
    (line): JSONContent => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })
  );
}

function convertMessageToJSONContent(
  content: string | null | undefined
): JSONContent {
  if (typeof content === "string") {
    return {
      type: "doc",
      content: convertTextToJSONContent(content),
    };
  }

  return { type: "doc", content: [] };
}

const key = new PluginKey("tiktokenizer");

function binarySearch(haystack: number[], needle: number) {
  let left = 0;
  let right = haystack.length - 1;

  while (left <= right) {
    const cursor = (left + right) >> 1;
    if (haystack[cursor]! <= needle) left = cursor + 1;
    else right = cursor - 1;
  }

  return needle + left;
}

export const TokenHighlighter = Extension.create<{ model: UserModelChoice }>({
  name: "colorHighlighter",

  addProseMirrorPlugins() {
    const encoder = getUserSelectedEncoder(this.options.model);

    const graphemer = new Graphemer();
    const textDecoder = new TextDecoder();

    function getTokenDecorations(doc: Node): DecorationSet {
      let text = "";
      const bounds: number[] = [];

      doc.descendants((node, position) => {
        const insert = (position > 0 ? `\n` : "") + node.textContent;
        bounds.push(text.length);
        text += insert;

        return false;
      });

      const encoding = encoder.encode(text, "all");

      let textAcc = 0;
      let byteAcc: number[] = [];
      let tokenAcc: number[] = [];
      let inputGraphemes = graphemer.splitGraphemes(text);

      const decorations: Decoration[] = [];
      for (let idx = 0; idx < encoding.length; idx++) {
        const token = encoding[idx]!;
        byteAcc.push(...encoder.decode_single_token_bytes(token));
        tokenAcc.push(token);

        const segmentText = textDecoder.decode(new Uint8Array(byteAcc));
        const graphemes = graphemer.splitGraphemes(segmentText);

        if (graphemes.every((item, idx) => inputGraphemes[idx] === item)) {
          decorations.push(
            Decoration.inline(
              binarySearch(bounds, textAcc),
              binarySearch(bounds, textAcc + segmentText.length),
              { class: cn(COLORS[decorations.length % COLORS.length]) }
            )
          );

          textAcc += segmentText.length;

          byteAcc = [];
          tokenAcc = [];
          inputGraphemes = inputGraphemes.slice(graphemes.length);
        }
      }

      return DecorationSet.create(doc, decorations);
    }

    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => getTokenDecorations(doc),
          apply: (transaction, oldState) =>
            transaction.docChanged
              ? getTokenDecorations(transaction.doc)
              : oldState,
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export function RichEditor(props: {
  value: string;
  onChange: (value: string) => void;
  model: UserModelChoice;
}) {
  const content = useMemo(
    () => convertMessageToJSONContent(props.value),
    [props.value]
  );

  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        TokenHighlighter.configure({ model: props.model }),
      ],
      editorProps: {
        attributes: { class: cn("outline-none p-3 border rounded-md") },
      },

      content,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        const values: Array<{ type: "text"; text: string }> = [];

        // assume root is type="doc"
        for (const child of json.content ?? []) {
          switch (child.type) {
            case "paragraph": {
              const text = (
                child.content
                  ?.map((i) => i.text)
                  .filter((x): x is string => x != null) ?? []
              ).join("");

              values.push({ type: "text" as const, text });
              break;
            }
            case "text": {
              if (child.text)
                values.push({ type: "text" as const, text: child.text });
              break;
            }
          }
        }

        let result: string = values
          .filter((i): i is { type: "text"; text: string } => i.type === "text")
          .map((i) => i.text)
          .join("\n");
        props.onChange?.(result);
      },
    },
    [props.model]
  );

  useEffect(() => {
    if (!editor) return;
    let { from, to } = editor.state.selection;
    editor.commands.setContent(content, false, { preserveWhitespace: "full" });
    editor.commands.setTextSelection({ from, to });
  }, [editor, content]);

  return (
    <div className="grid w-full">
      <EditorContent editor={editor} />
    </div>
  );
}
