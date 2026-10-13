import type { ReactNode } from "react";

import Link from "@/components/common/ui/Link";

interface S3FolderLinkProps {
  /** Public S3 bucket name. Defaults to `cadcat`. */
  bucket?: string;
  /** Folder path within the bucket, with a trailing slash,
   * e.g. "wrf/hdd-cdd-tool/multimodel_per_boundary/". */
  folder: string;
  children: ReactNode;
}

/** Inline link to a folder in a public S3 bucket's web file browser (opens in
 * a new tab). The bucket must host the browser at its `index.html`. */
export default function S3FolderLink({ bucket = "cadcat", folder, children }: S3FolderLinkProps) {
  return <Link href={`https://${bucket}.s3.amazonaws.com/index.html#${folder}`}>{children}</Link>;
}
