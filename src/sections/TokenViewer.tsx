import { type RouterOutputs } from "~/utils/api";
import { Fragment, useState } from "react";
import { cn } from "~/utils/cn";

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

export function TokenViewer(props: {
  isFetching: boolean;
  data: RouterOutputs["token"]["encode"] | undefined;
}) {
  const [indexHover, setIndexHover] = useState<null | number>(null);
  return (
    <>
      <div className="rounded-md border bg-slate-50 p-4 shadow-sm">
        <p className="text-sm ">Token count</p>
        <p className="text-lg">{props.data?.encoding.length ?? 0}</p>
      </div>

      <pre className="min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm">
        {props.data?.segments.map((i, idx) => (
          <span
            key={idx}
            onMouseEnter={() => setIndexHover(idx)}
            onMouseLeave={() => setIndexHover(null)}
            className={cn(
              "transition-all",
              (indexHover == null || indexHover === idx) &&
                COLORS[idx % COLORS.length],
              props.isFetching && "opacity-50"
            )}
          >
            {i}
          </span>
        ))}
      </pre>

      <pre
        className={
          "min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm"
        }
      >
        {props.data && (props.data?.encoding.length ?? 0) > 0 && (
          <span
            className={cn(
              "transition-opacity",
              props.isFetching && "opacity-50"
            )}
          >
            [
            {[...props.data.encoding].map((id, idx) => (
              <Fragment key={idx}>
                <span
                  onMouseEnter={() => setIndexHover(idx)}
                  onMouseLeave={() => setIndexHover(null)}
                  className={cn(
                    "transition-colors",
                    indexHover === idx && COLORS[idx % COLORS.length]
                  )}
                >
                  {id}
                </span>
                {props.data && idx !== props.data.encoding.length - 1 && ", "}
              </Fragment>
            ))}
            ]
          </span>
        )}
      </pre>
    </>
  );
}
