import { useRouter } from "next/router";
import { TokenizerInfo } from "~/pages/[hf_org]/[model]/index";

export default function Page() {
  const router = useRouter();
  const model = router.query.model as string;

  return <TokenizerInfo model={model} />;
}
