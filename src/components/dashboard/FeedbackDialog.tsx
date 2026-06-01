"use client";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

import Link from "@/components/common/ui/Link";
import { FEEDBACK_URL } from "@/config/constants";
import { analytics } from "@/lib/analytics";

import styles from "./FeedbackDialog.module.scss";

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.title}>
        Feedback
        <IconButton onClick={onClose} className={styles.closeButton} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <p className={styles.body}>
          Please fill out{" "}
          <Link
            href={FEEDBACK_URL}
            className={styles.surveyLink}
            onClick={() => analytics.trackExternalLink(FEEDBACK_URL, "feedback survey")}
          >
            this survey
          </Link>{" "}
          to share any feedback you have. Suggestions for improvements, issues with the tool, or
          general comments are all welcome.
        </p>
      </DialogContent>
    </Dialog>
  );
}
