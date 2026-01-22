import { Typography } from "@mui/material";

import Icon from "@/components/common/ui/Icon";

import styles from "./ErrorView.module.scss";

interface ErrorViewProps {
  logo?: boolean;
  title?: string;
  message: string;
  children?: React.ReactNode;
}

export default function ErrorView({ logo, title, message, children }: ErrorViewProps) {
  return (
    <div className={styles.errorView}>
      <div className={styles.inner}>
        <div className={styles.content}>
          {logo && <Icon className={styles.logo} variant="logoCalAdapt" />}
          {title && <Typography variant="h2">{title}</Typography>}
          <Typography variant="body1">{message}</Typography>
          {children}
        </div>
      </div>
    </div>
  );
}
