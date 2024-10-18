import { useRouter } from "next/router";
import { z } from "zod";
import { TokenInfo } from "~/pages/openai/[model]/[token]";

const OrganizationModelAndToken = z.object({
  hf_org: z.string(),
  model: z.string(),
  token: z.string(),
});

export default function Page() {
  const router = useRouter();

  // On initial load the router query is {}, so just return
  if (Object.keys(router.query).length === 0) {
    return null;
  }

  const { hf_org, model, token } = OrganizationModelAndToken.parse(
    router.query
  );

  return <TokenInfo model={`${hf_org}/${model}`} token={token} />;
}
