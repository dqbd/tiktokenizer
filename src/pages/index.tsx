import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Github, Slash, Twitter } from "lucide-react";

import { api, type RouterInputs } from "~/utils/api";
import { ChatGPTEditor } from "../sections/ChatGPTEditor";
import { EncoderSelect } from "~/sections/EncoderSelect";
import { TokenViewer } from "~/sections/TokenViewer";
import { TextArea } from "~/components/Input";

const Home: NextPage = () => {
  const [params, setParams] = useState<RouterInputs["token"]["encode"]>({
    model: "chatgpt-3.5-turbo",
    text: "",
  });

  const encode = api.token.encode.useQuery(params, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const [liveText, setLiveText] = useState("");
  useEffect(() => {
    const text = liveText;
    const timeout = window.setTimeout(
      () => setParams((params) => ({ ...params, text })),
      0
    );
    return () => window.clearTimeout(timeout);
  }, [liveText]);

  return (
    <>
      <Head>
        <title>Tiktokenizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-4 p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold">Tiktokenizer</h1>

          <EncoderSelect
            onChange={(update) =>
              setParams((params) => ({ text: params.text, ...update }))
            }
            value={params}
          />
        </div>

        {encode.error && (
          <div className="flex gap-3 rounded-md border border-red-300 bg-red-200 p-4 text-red-900">
            <Slash />
            <strong>Failed to encode</strong>
            <p>{encode.error?.message}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            {"model" in params && params.model === "chatgpt-3.5-turbo" && (
              <ChatGPTEditor onChange={setLiveText} />
            )}

            <TextArea
              value={liveText}
              onChange={(e) => setLiveText(e.target.value)}
              className="min-h-[256px] rounded-md border p-4 font-mono shadow-sm"
            />

            {encode.data?.encoding.find((i) => i >= 900_000) && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Note</span>: Using a placeholder
                token value (eg. 900000) for the name field.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <TokenViewer data={encode.data} isFetching={encode.isFetching} />
          </section>
        </div>
        <div className="flex justify-between text-center md:mt-6">
          <p className=" text-sm text-slate-400">
            Created with the generous help from{" "}
            <a
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
              href="https://diagram.com"
            >
              Diagram
            </a>
            .
          </p>

          <div className="flex items-center gap-4">
            <a
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
              href="https://github.com/dqbd/tiktokenizer"
            >
              <Github />
            </a>
            <a
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
              href="https://twitter.com/__dqbd"
            >
              <Twitter />
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
