"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import clsx from "clsx";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { SITE_TITLE, SITE_URL } from "@/config/constants";

import styles from "./CitationBox.module.scss";

export interface CitationBoxProps {
  /** Page or tool title as it should appear in the citation, e.g. navLinks.climateMetricsMap.label. */
  title: string;
  /** Set false when nesting inside a container that already has its own top border/spacing (e.g. a page footer). */
  bordered?: boolean;
  className?: string;
}

const COPIED_TIMEOUT_MS = 1500;

/**
 * Auto-generated "how to cite this page" box, in the APA format Cal-Adapt uses
 * site-wide: "Cal-Adapt. (Year). {title}. Cal-Adapt. {url}". Mirrors the citation
 * appendix on the Cal-Adapt guidance site, which is likewise generated from page
 * title, URL, and year rather than hand-written per page.
 */
export default function CitationBox({ title, bordered = true, className }: CitationBoxProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const year = new Date().getFullYear();
  const url = `${SITE_URL}${pathname}`;
  const citation = `${SITE_TITLE}. (${year}). ${title}. ${SITE_TITLE}. ${url}`;

  const handleCopy = () => {
    void navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS);
    });
  };

  return (
    <div className={clsx(styles.citationBox, bordered && styles.bordered, className)}>
      <div className={styles.label}>
        <span>For attribution, please cite this work as:</span>
        <Button
          type="button"
          variant="tertiary"
          size="small"
          prefix={<Icon variant={copied ? "check" : "copy"} width={16} height={16} aria-hidden />}
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <p className={styles.text}>
        {SITE_TITLE}. ({year}). <em>{title}</em>. {SITE_TITLE}. <Link href={url}>{url}</Link>
      </p>
    </div>
  );
}
