import type { ReactNode } from "react";

import { collectCitationKeys, injectCitationNumbers } from "./story-citations";
import StoryReferences from "./StoryReferences";

interface StoryDocumentProps {
  children: ReactNode;
}

export default async function StoryDocument({ children }: StoryDocumentProps) {
  const citationKeys = collectCitationKeys(children);
  const body = injectCitationNumbers(children, citationKeys);

  return (
    <>
      {body}
      {citationKeys.length > 0 ? <StoryReferences citationKeys={citationKeys} /> : null}
    </>
  );
}
