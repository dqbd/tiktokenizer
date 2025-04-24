import { Fragment, useState } from "react";
import { cn } from "~/utils/cn";

import BN from "bignumber.js";
import { Checkbox } from "~/components/Checkbox";
import { type TokenizerResult } from "~/models/tokenizer";

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

// Map light colors to dark variants
const DARK_COLORS = {
  "bg-sky-200": "dark:bg-sky-900",
  "bg-amber-200": "dark:bg-amber-900",
  "bg-blue-200": "dark:bg-blue-900",
  "bg-green-200": "dark:bg-green-900",
  "bg-orange-200": "dark:bg-orange-900",
  "bg-cyan-200": "dark:bg-cyan-900",
  "bg-gray-200": "dark:bg-gray-700", // Adjusted gray for potentially better contrast
  "bg-purple-200": "dark:bg-purple-900",
  "bg-indigo-200": "dark:bg-indigo-900",
  "bg-lime-200": "dark:bg-lime-900",
  "bg-rose-200": "dark:bg-rose-900",
  "bg-violet-200": "dark:bg-violet-900",
  "bg-yellow-200": "dark:bg-yellow-900",
  "bg-emerald-200": "dark:bg-emerald-900",
  "bg-zinc-200": "dark:bg-zinc-700", // Adjusted zinc
  "bg-red-200": "dark:bg-red-900",
  "bg-fuchsia-200": "dark:bg-fuchsia-900",
  "bg-pink-200": "dark:bg-pink-900",
  "bg-teal-200": "dark:bg-teal-900",
};

function encodeWhitespace(str: string) {
  let result = str;

  result = result.replaceAll(" ", "⋅");
  result = result.replaceAll("\t", "→");
  result = result.replaceAll("\f", "\\f\f");
  result = result.replaceAll("\b", "\\b\b");
  result = result.replaceAll("\v", "\\v\v");

  result = result.replaceAll("\r", "\\r\r");
  result = result.replaceAll("\n", "\\n\n");
  result = result.replaceAll("\\r\r\\n\n", "\\r\\n\r\n");

  return result;
}

export function TokenViewer(props: {
  isFetching: boolean;
  model: string | undefined;
  data: TokenizerResult | undefined;
}) {
  const [indexHover, setIndexHover] = useState<null | number>(null);

  const tokenCount =
    props.data?.segments?.reduce((memo, i) => memo + i.tokens.length, 0) ?? 0;

  const [showWhitespace, setShowWhitespace] = useState(false);

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-grow rounded-md border dark:border-gray-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-sm ">Token count</p>
          <p className="text-lg">{tokenCount}</p>
        </div>
      </div>

      <pre className="min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border dark:border-gray-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm">
        {props.data?.segments?.map(({ text }, idx) => {
          const lightColor = COLORS[idx % COLORS.length]!;
          const darkColor = DARK_COLORS[lightColor as keyof typeof DARK_COLORS];
          return (
            <span
              key={idx}
              onMouseEnter={() => setIndexHover(idx)}
              onMouseLeave={() => setIndexHover(null)}
              className={cn(
                "transition-all",
                (indexHover == null || indexHover === idx) && lightColor,
                (indexHover == null || indexHover === idx) && darkColor,
                props.isFetching && "opacity-50"
              )}
            >
              {showWhitespace || indexHover === idx
                ? encodeWhitespace(text)
                : text}
            </span>
          );
        })}
      </pre>

      <pre
        className={
          "min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border dark:border-gray-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-sm"
        }
      >
        {props.data && tokenCount > 0 && (
          <span
            className={cn(
              "transition-opacity",
              props.isFetching && "opacity-50"
            )}
          >
            {props.data?.segments?.map((segment, segmentIdx) => (
              <Fragment key={segmentIdx}>
                {segment.tokens.map((token) => (
                  <Fragment key={token.idx}>
                    {(() => {
                      const lightColor = COLORS[segmentIdx % COLORS.length]!;
                      const darkColor = DARK_COLORS[lightColor as keyof typeof DARK_COLORS];
                      return (
                        <span
                          onMouseEnter={() => setIndexHover(segmentIdx)}
                          onMouseLeave={() => setIndexHover(null)}
                          className={cn(
                            "transition-colors",
                            indexHover === segmentIdx && lightColor,
                            indexHover === segmentIdx && darkColor
                          )}
                        >
                          {token.id}
                        </span>
                      );
                    })()}
                    <span className="last-of-type:hidden">{", "}</span>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </span>
        )}
      </pre>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={showWhitespace}
          onClick={() => setShowWhitespace((v) => !v)}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show whitespace
        </label>
      </div>
    </>
  );
}
