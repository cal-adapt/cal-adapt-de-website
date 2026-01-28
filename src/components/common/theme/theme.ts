import { createTheme } from "@mui/material/styles";

import { mediaQueries } from "@/utils/styles";

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
const BODY_TEXT_COLOR_LIGHT = "#FFF";
const BG_DEFAULT = "#FFF";
const BG_PAPER = "#FFF";

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
      main: "#333538",
      dark: "#232527",
      light: "#5B5D5F",
      contrastText: BODY_TEXT_COLOR_LIGHT,
    },
    success: {
      main: "#7EC09F",
      dark: "#58866F",
      light: "#97CCB2",
      contrastText: BODY_TEXT_COLOR,
    },
    info: {
      main: "#59A1C1",
      contrastText: BODY_TEXT_COLOR_LIGHT,
    },
    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
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
              color: "#333538",
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
          backgroundColor: "#FFF",
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          color: "#000000",
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
        main: BODY_TEXT_COLOR_LIGHT,
        light: BODY_TEXT_COLOR_LIGHT,
        dark: BODY_TEXT_COLOR_LIGHT,
        contrastText: BODY_TEXT_COLOR,
      },
      name: "secondaryReversed",
    }),
    primaryBlue: theme.palette.augmentColor({
      color: {
        main: "#4C8EB4",
        light: "#6FA4C3",
        dark: "#35637D",
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
        contrastText: BODY_TEXT_COLOR_LIGHT,
      },
      name: "infoDark",
    }),
    grey: theme.palette.augmentColor({
      color: {
        main: "#e8e8e8",
        light: "#f5f5f5",
        dark: "#d0d0d0",
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
