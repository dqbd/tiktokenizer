import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { z } from "zod";
import { createTokenizer, type Tokenizer } from "~/models/tokenizer";

const byteToHex = (byte: number) => byte.toString(16).padStart(2, "0");

function Bytes({ bytes }: { bytes: Uint8Array }) {
  return <span>{[...bytes].map(byteToHex).join(" ")}</span>;
}

const ModelAndToken = z.object({
  model: z.string(),
  token: z.string(),
});

export default function Page() {
  const router = useRouter();

  // On initial load the router query is {}, so just return
  if (Object.keys(router.query).length === 0) {
    return null;
  }

  const { model, token } = ModelAndToken.parse(router.query);

  return <TokenInfo model={model} token={token} />;
}

export function TokenInfo({ model, token }: { model: string; token: string }) {
  const _tokenizer = useQuery({
    queryKey: [model],
    queryFn: ({ queryKey: [model] }) => createTokenizer(model!),
  });

  const tokenizer = _tokenizer.data;
  const tokenInfo = _tokenizer.data?.getInfo(Number(token));

  return (
    <div>
      <h1>
        Token: {token} / {tokenizer?.tokenCount}
      </h1>
      <p>
        Model: <Link href={`/openai/${model}`}>{model}</Link>
      </p>
      <div>
        Bytes:{" "}
        <p className="inline-block rounded border border-gray-300 bg-gray-100 p-2 font-mono text-gray-700">
          {tokenInfo?.bytes ? <Bytes bytes={tokenInfo.bytes} /> : "N/A"}
        </p>
      </div>
      <p>Text: {tokenInfo?.text}</p>
      {tokenInfo?.merge && <p>Merges: {tokenInfo.merge.length}</p>}
      <p>Special: {tokenInfo?.special ? "Yes" : "No"}</p>
    </div>
  );
}
