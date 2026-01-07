import Image from "next/image";

import { Typography } from "@mui/material";

import Button from "@/components/common/ui/Button";

import logo from "../../../public/img/logos/cal-adapt-data-download.png";

import styles from "./MobileView.module.scss";

export default function MobileView() {
  return (
    <div className={styles.mobileView}>
      <div className={styles.inner}>
        <Image src={logo} alt="Cal Adapt logo" style={{ margin: "0 auto" }} />
        <Typography variant="body1">
          Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or
          laptop computer
        </Typography>
        <Button href="/">Go to the homepage</Button>
      </div>
    </div>
  );
}
