import {
  encoding_for_model,
  get_encoding,
  type TiktokenModel,
  type TiktokenEncoding,
} from "tiktoken";

export type UserModelChoice =
  | { model: TiktokenModel }
  | { encoder: TiktokenEncoding };

export function getUserSelectedEncoder(params: UserModelChoice) {
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
