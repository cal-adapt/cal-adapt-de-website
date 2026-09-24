import { ArrowLeft } from "lucide-react";

import Button from "@/components/common/ui/Button";

interface BackLinkProps {
  href: string;
  label: string;
}

/** "← Back to …" link shown above a sub-page's title. */
export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Button
      variant="tertiary"
      size="small"
      href={href}
      prefix={<ArrowLeft size={16} strokeWidth={2} aria-hidden />}
    >
      Back to {label}
    </Button>
  );
}
