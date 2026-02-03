"use client";

import Image from "next/image";

import Button from "@/components/common/ui/Button";

import styles from "./ImageText.module.scss";

export default function ImageText() {
  return (
    <div className={styles.imageText}>
      <div className={styles.image}>
        <Image
          src="/img/homepage-misc/desert-landscape.webp"
          alt="An image of a water stream in a desert landscape"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.content}>
        <h2>Fueling Innovation</h2>
        <p>
          The California Energy Commission supports research projects that advance climate data
          development and enhance Cal-Adapt for improved climate planning in California.
        </p>
        <Button href="https://cmip5.cal-adapt.org/grants">Learn about our grants</Button>
      </div>
    </div>
  );
}
