import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { createTokenizer, Tokenizer } from "~/models/tokenizer";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";

const OrganizationModel = z.object({
  hf_org: z.string(),
  model: z.string(),
});

export default function Page() {
  const router = useRouter();
  if (Object.keys(router.query).length === 0) {
    return null;
  }
  const { hf_org, model } = OrganizationModel.parse(router.query);
  return <TokenizerInfo model={`${hf_org}/${model}`} />;
}

function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

function TokensList({
  model,
  tokenizer,
  max = 1000,
}: {
  model: string;
  tokenizer: Tokenizer;
  max?: number;
}) {
  const tokens = Array.from(range(max));
  return (
    <ol className="flex flex-wrap gap-2">
      {tokens.map((i) => (
        <li key={i} className="font-mono">
          <Link
            href={`/${model}/${i}`}
            className="hover:bg-blue-400 hover:text-white"
          >
            {tokenizer.getInfo(i)?.text}
          </Link>
          {","}
        </li>
      ))}
    </ol>
  );
}

export function TokenizerInfo({ model }: { model: string }) {
  const tq = useQuery({
    queryKey: [model],
    queryFn: ({ queryKey: [model] }) => createTokenizer(model!),
  });

  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const tokenizer = tq.data;
  if (tq.isLoading) {
    return (
      <div className="mx-auto flex max-w-prose flex-col gap-4">
        <h1>Tokenizer Info</h1>
        <p>Loading {model}...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-4">
      <h1>Tokenizer Info</h1>
      <p>Model: {tokenizer?.name}</p>
      <p>Added tokens: {tokenizer?.specialTokens?.length}</p>

      <ul className="flex flex-wrap gap-2">
        {tokenizer?.specialTokens &&
          Object.entries(tokenizer.specialTokens).map(([token, id]) => (
            <li
              key={token}
              className="flex flex-col"
              onMouseEnter={() => setHoveredToken(id)}
              onMouseLeave={() => setHoveredToken(null)}
            >
              <Link href={`/${model}/${id}`}>{token}</Link>
            </li>
          ))}
      </ul>
      {hoveredToken && (
        <div className="flex-col gap-4 bg-white p-4">
          <p>ID: {hoveredToken}</p>
        </div>
      )}
      <p>Tokens: {tokenizer?.tokenCount}</p>
      {tokenizer && (
        <TokensList model={model} tokenizer={tokenizer} max={1000} />
      )}
    </div>
  );
}
