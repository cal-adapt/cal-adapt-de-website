import type { Metadata } from "next";

import NotFoundTracker from "@/components/common/analytics/NotFoundTracker";
import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import { SITE_TITLE } from "@/config/constants";

export const metadata: Metadata = {
  title: `Page Not Found - ${SITE_TITLE}`,
};

export default function NotFoundPage() {
  return (
    <>
      <NotFoundTracker />
      <ErrorView
        title="404"
        message="Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL might be incorrect."
      >
        <Button href="/">Go to the homepage</Button>
      </ErrorView>
    </>
  );
}
