import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { Github, Twitter } from "lucide-react";

import { ChatGPTEditor } from "../sections/ChatGPTEditor";
import {
  EncoderSelect,
  type ModelOnly,
  isEncoder,
  isModel,
} from "~/sections/EncoderSelect";
import { TokenViewer } from "~/sections/TokenViewer";
import { TextArea } from "~/components/Input";
import {
  encoding_for_model,
  get_encoding,
  type TiktokenModel,
  type TiktokenEncoding,
} from "tiktoken";
import { getSegments } from "~/utils/segments";
import { useRouter } from "next/router";

function getUserSelectedEncoder(
  params: { model: TiktokenModel } | { encoder: TiktokenEncoding }
) {
  if ("model" in params) {
    if (
      params.model === "gpt-4" ||
      params.model === "gpt-4-32k" ||
      params.model === "gpt-3.5-turbo" ||
      params.model === "gpt-4-1106-preview"
    ) {
      return encoding_for_model(params.model, {
        "<|im_start|>": 100264,
        "<|im_end|>": 100265,
        "<|im_sep|>": 100266,
      });
    }

    return encoding_for_model(params.model);
  }

  if ("encoder" in params) {
    return get_encoding(params.encoder);
  }

  throw new Error("Invalid params");
}

function isChatModel(
  params: { model: TiktokenModel } | { encoder: TiktokenEncoding }
): params is {
  model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-32k" | "gpt-4-1106-preview";
} {
  return (
    "model" in params &&
    (params.model === "gpt-3.5-turbo" ||
      params.model === "gpt-4" ||
      params.model === "gpt-4-1106-preview" ||
      params.model === "gpt-4-32k")
  );
}

function useParams() {
  const router = useRouter();

  const params = useMemo((): ModelOnly => {
    if (typeof router.query.model === "string" && isModel(router.query.model)) {
      return { model: router.query.model };
    }

    if (
      typeof router.query.encoder === "string" &&
      isEncoder(router.query.encoder)
    ) {
      return { encoder: router.query.encoder };
    }

    return { model: "gpt-3.5-turbo" };
  }, [router.query]);

  const setParams = (model: ModelOnly) => {
    router.push({
      pathname: router.pathname,
      query: model,
    });
  };

  return [params, setParams] as const;
}
const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
  props
) => {
  const [inputText, setInputText] = useState<string>("");

  const [params, setParams] = useParams();

  const [encoder, setEncoder] = useState(() => getUserSelectedEncoder(params));
  const data = getSegments(encoder, inputText);

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
            value={params}
            onChange={(update) => {
              setEncoder((encoder) => {
                encoder.free();
                return getUserSelectedEncoder(update);
              });

              if (isChatModel(update) !== isChatModel(params)) {
                setInputText("");
              }

              setParams(update);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            {isChatModel(params) && (
              <ChatGPTEditor model={params.model} onChange={setInputText} />
            )}

            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[256px] rounded-md border p-4 font-mono shadow-sm"
            />
          </section>

          <section className="flex flex-col gap-4">
            <TokenViewer
              model={"model" in params ? params.model : undefined}
              data={data}
              isFetching={false}
            />
          </section>
        </div>
        <style jsx>
          {`
            .diagram-link:hover > span {
              margin-left: 0;
            }

            .diagram-link > svg {
              opacity: 0;
              transform: scale(0.8);
            }
            .diagram-link:hover > svg {
              opacity: 1;
              transform: scale(1);
            }
          `}
        </style>
        <div className="flex justify-between text-center md:mt-6">
          <p className=" text-sm text-slate-400">
            Built by{" "}
            <a
              target="_blank"
              rel="noreferrer"
              className="text-slate-800"
              href="https://duong.dev"
            >
              dqbd
            </a>
            . Created with the generous help from{" "}
            <a
              target="_blank"
              rel="noreferrer"
              className="diagram-link text-slate-800"
              href="https://diagram.com"
            >
              <svg
                width="20"
                height="20"
                className="inline-flex align-top transition-all"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10.9969 16.8033C14.3214 16.3204 16.875 13.4584 16.875 10C16.875 6.5416 14.3214 3.67963 10.9969 3.19674C10.7004 3.15368 10.5521 3.13215 10.3988 3.19165C10.2758 3.23941 10.1459 3.35182 10.0809 3.46672C10 3.60986 10 3.78158 10 4.125V15.875C10 16.2184 10 16.3901 10.0809 16.5333C10.1459 16.6482 10.2758 16.7606 10.3988 16.8084C10.5521 16.8679 10.7004 16.8463 10.9969 16.8033Z"
                  fill="currentColor"
                />
              </svg>{" "}
              <span className="ml-[-23px] transition-all">Diagram.</span>
            </a>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: { query: context.query } };
};

export default Home;
