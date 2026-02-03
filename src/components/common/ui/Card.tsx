"use client";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import Button from "@/components/common/ui/Button";
import Link from "@/components/common/ui/Link";

import styles from "./Card.module.scss";

type CardProps = {
  title: string;
  description: string;
  href: string;
  img: string;
  isNewTab?: boolean;
};

export default function Card({ title, description, href, img, isNewTab }: CardProps) {
  return (
    <Link
      className={styles.card}
      href={href}
      openInNewTab={isNewTab}
      style={{ backgroundImage: `url(${img})` }}
      aria-label={`${title}: ${description}`}
    >
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <Button variant="floating" ariaHidden tabIndex={-1}>
        <ArrowForwardOutlinedIcon />
      </Button>
    </Link>
  );
}
