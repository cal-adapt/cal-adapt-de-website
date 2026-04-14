import { createTheme } from "@mui/material/styles";

import { mediaQueries } from "@/config/breakpoints";
import { BLUE, GREY } from "@/config/colors";

const { palette } = createTheme();

// Augment the palette to include a second palette color
declare module "@mui/material/styles" {
  interface Palette {
    primaryBlue: Palette["primary"];
    secondaryReversed: Palette["secondary"];
    infoYellow: Palette["info"];
    grey: Palette["primary"];
  }

  interface PaletteOptions {
    primaryBlue?: PaletteOptions["primary"];
    secondaryReversed?: PaletteOptions["secondary"];
    infoYellow?: PaletteOptions["info"];
    infoDark?: PaletteOptions["info"];
    grey?: PaletteOptions["primary"];
  }

  interface TypographyVariants {
    body3: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body3: true;
  }
}

// Update the Button's color options to include an ochre option
declare module "@mui/material/Fab" {
  interface FabPropsColorOverrides {
    secondaryReversed: true;
    primaryBlue: true;
  }
}

declare module "@mui/material/Alert" {
  interface AlertPropsColorOverrides {
    infoYellow: true;
    secondaryReversed: true;
    primaryBlue: true;
    infoDark: true;
    grey: true;
  }
}

const BODY_TEXT_COLOR = "#1C1C1C";
const COLOR_WHITE = "var(--color-white)";
const COLOR_BLACK = "var(--color-black)";
/** Solid white for MUI `augmentColor` (requires a parseable color value). */
const WHITE_SOLID = "#ffffff";

let theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#E8F4FB",
      dark: "#C9DDE9",
      light: "#FAFDFF",
      contrastText: BODY_TEXT_COLOR,
    },
    secondary: {
      main: GREY[4],
      dark: GREY[5],
      light: GREY[3],
      contrastText: COLOR_WHITE,
    },
    success: {
      main: "#7EC09F",
      dark: "#58866F",
      light: "#97CCB2",
      contrastText: BODY_TEXT_COLOR,
    },
    info: {
      main: "#59A1C1",
      contrastText: COLOR_WHITE,
    },
    background: {
      default: COLOR_WHITE,
      paper: COLOR_WHITE,
    },
  },
  typography: {
    htmlFontSize: 10,
    fontFamily: "inherit",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 600,
      fontSize: "2rem",
      [`@media ${mediaQueries.min.large}`]: { fontSize: "6rem" },
    },
    h2: {
      fontWeight: 700,
      fontSize: "3rem",
      [`@media ${mediaQueries.min.large}`]: { fontSize: "6rem" },
    },
    h3: {
      fontWeight: 700,
      fontSize: "3.5rem",
    },
    h4: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h5: {
      fontWeight: 800,
      fontSize: "2.4rem",
    },
    h6: {
      fontWeight: 700,
      fontSize: "1.6rem",
      color: "#373C47",
    },
    body1: {
      fontSize: "1.6rem",
    },
    body2: {
      color: "#6F6F6F",
    },
    body3: {
      fontWeight: 700,
    },
    caption: {
      fontSize: "1.2rem",
      textTransform: "uppercase",
    },
    overline: {
      fontSize: "1.2rem",
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "25px",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              color: GREY[4],
              boxShadow: "none",
              textTransform: "capitalize",
              borderRadius: "8px",
            }),
          ...(ownerState.variant === "contained" &&
            ownerState.color === "secondary" && {
              boxShadow: "none",
              textTransform: "capitalize",
              borderRadius: "8px",
            }),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: "15px",
          borderRadius: "3px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLOR_WHITE,
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          color: COLOR_BLACK,
          borderRadius: "6px",
          maxWidth: 220,
          padding: "15px",
        },
      },
    },
  },
});

// Create custom palettes
theme = createTheme(theme, {
  palette: {
    secondaryReversed: theme.palette.augmentColor({
      color: {
        main: WHITE_SOLID,
        light: WHITE_SOLID,
        dark: WHITE_SOLID,
        contrastText: BODY_TEXT_COLOR,
      },
      name: "secondaryReversed",
    }),
    primaryBlue: theme.palette.augmentColor({
      color: {
        main: BLUE[4],
        light: BLUE[3],
        dark: BLUE[5],
      },
      name: "primaryBlue",
    }),
    infoYellow: theme.palette.augmentColor({
      color: {
        main: "#EBC699",
        light: "#EFD1AD",
        dark: "#A48A6B",
        contrastText: BODY_TEXT_COLOR,
      },
      name: "infoYellow",
    }),
    infoDark: theme.palette.augmentColor({
      color: {
        main: "#20333D",
        light: "#4C5B63",
        dark: "#16232A",
        contrastText: COLOR_WHITE,
      },
      name: "infoDark",
    }),
    grey: theme.palette.augmentColor({
      color: {
        main: GREY[2],
        light: GREY[1],
        dark: GREY[3],
        contrastText: BODY_TEXT_COLOR,
      },
      name: "grey",
    }),
  },
});

// Override components after creating custom palettes
theme = createTheme(theme, {
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          color: theme.palette.secondary.main, // Default unselected state
          "&.Mui-checked": {
            color: theme.palette.primaryBlue.main, // Checked state
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: theme.palette.primaryBlue.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: theme.palette.primaryBlue.main,
            fontWeight: "bold",
          },
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        color: theme.palette.primaryBlue.main, // Default unselected state
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        option: {
          '&[aria-selected="true"]': {
            color: theme.palette.primaryBlue.main,
          },
          '&[data-focus="true"]': {
            color: theme.palette.primaryBlue.main,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledPrimaryBlue: {
          backgroundColor: theme.palette.primaryBlue.dark,
          color:
            theme.palette.primaryBlue.contrastText ??
            theme.palette.getContrastText(theme.palette.primaryBlue.dark),
          "& .MuiAlert-icon": {
            color:
              theme.palette.primaryBlue.contrastText ??
              theme.palette.getContrastText(theme.palette.primaryBlue.dark),
          },
        },
        filledInfo: {
          backgroundColor: theme.palette.info.dark,
          color: theme.palette.info.contrastText, // ✅ force contrast color
          "& .MuiAlert-icon": {
            color: theme.palette.info.contrastText, // ✅ icon contrast too
          },
        },
        filledSecondaryReversed: {
          backgroundColor: theme.palette.secondaryReversed.main,
          color: theme.palette.secondaryReversed.contrastText, // ✅ force contrast color
          "& .MuiAlert-icon": {
            color: theme.palette.secondaryReversed.contrastText, // ✅ icon contrast too
          },
        },
        filledGrey: {
          backgroundColor: theme.palette.grey.main,
          color: theme.palette.grey.contrastText,
          "& .MuiAlert-icon": {
            color: theme.palette.grey.contrastText,
          },
        },
      },
    },
  },
});

export default theme;
