import Citation from "@/components/common/ui/Citation";
import { bibliographyEntryId } from "@/lib/citations/bibliography";

export interface StoryCitationProps {
  citationKey: string;
  /** Set by `StoryDocument` from first appearance. */
  n?: number;
}

export default function StoryCitation({ citationKey, n }: StoryCitationProps) {
  if (n == null || n < 1) {
    throw new Error(`StoryCitation "${citationKey}" must be rendered inside StoryDocument`);
  }

  return <Citation n={n} href={`#${bibliographyEntryId(citationKey)}`} label={`Reference ${n}`} />;
}
