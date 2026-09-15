import Alert from "@/components/common/ui/Alert";
import Link from "@/components/common/ui/Link";
import { FEEDBACK_URL } from "@/config/constants";
import { analytics } from "@/lib/analytics";

import styles from "./BetaFeedbackAlert.module.scss";

/** Beta-notice banner used at the top of in-progress tools, prompting users
 *  to leave feedback via the shared feedback form. */
export default function BetaFeedbackAlert() {
  return (
    <Alert severity="info" className={styles.alert} ariaLabel="Beta notice">
      Suggestions for improvements, questions, and general comments are all welcome. Fill out the
      feedback form{" "}
      <Link
        href={FEEDBACK_URL}
        onClick={() => analytics.trackExternalLink(FEEDBACK_URL, "feedback survey")}
      >
        here
      </Link>
      .
    </Alert>
  );
}
