"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import theme from "./theme";

interface ThemeRegistryProps {
  children: React.ReactNode;
  options: any;
}

export default function ThemeRegistry({ children, options }: ThemeRegistryProps) {
  return (
    <NextAppDirEmotionCacheProvider options={options}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
