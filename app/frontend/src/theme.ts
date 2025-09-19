import { createTheme, alpha } from "@mui/material/styles";

const PRIMARY = "#0A0A0A"; // near-black (still used for text emphasis)
const ACCENT_BG = 'rgb(40 78 76 / var(--tw-bg-opacity))'; // requested button + navbar scrolled background
const SECONDARY = "#F5B300"; // gold
const SUCCESS = "#27AE60"; // green accent
const PAGE_BG_VAR = 'rgb(255 249 233 / var(--tw-bg-opacity))'; // requested warm page background
const BG = '#FFF9E9'; // hex equivalent for palette usage
const TEXT_PRIMARY = "#0A0A0A";
const TEXT_SECONDARY = "#4F4F4F";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: PRIMARY },
    secondary: { main: SECONDARY },
    success: { main: SUCCESS },
  background: { default: BG, paper: '#FFFFFF' },
    text: { primary: TEXT_PRIMARY, secondary: TEXT_SECONDARY },
    divider: alpha('#0A0A0A', 0.12)
  },
  typography: {
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600, letterSpacing: -1 },
    h2: { fontWeight: 600, letterSpacing: -0.5 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0.3 },
    subtitle1: { fontWeight: 500 },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.5 }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
  'html, body, #root': { '--tw-bg-opacity': 1, backgroundColor: PAGE_BG_VAR },
  body: { fontFeatureSettings: '"cv02","cv03","cv04","cv11"', backgroundColor: PAGE_BG_VAR },
        '::selection': { background: SECONDARY, color: '#fff' },
        img: { display: 'block', maxWidth: '100%' }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.08)'
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
            transition: 'box-shadow .35s, transform .35s, border-color .35s',
            boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
            border: '1px solid #E0E0E0',
            '&:hover': {
              boxShadow: '0 6px 18px -6px rgba(0,0,0,0.16)',
              borderColor: '#D4D4D4'
            }
        })
      }
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          paddingInline: 18,
          fontSize: 14,
          '--tw-bg-opacity': 1,
          '&:active': { transform: 'translateY(1px)' },
          boxShadow: '0 2px 6px -2px rgba(0,0,0,0.18)',
          transition: 'background-color .25s, color .25s, border-color .25s, box-shadow .35s',
          '&.MuiButton-containedPrimary': {
            background: ACCENT_BG,
            color: '#FFFFFF',
            border: '1px solid rgba(40,78,76,0.9)',
            '&:hover': { '--tw-bg-opacity': 0.85, background: ACCENT_BG },
            '&:active': { '--tw-bg-opacity': 0.75, background: ACCENT_BG }
          },
          '&.MuiButton-outlinedPrimary': {
            color: 'rgb(40 78 76 / 1)',
            border: '1px solid rgba(40,78,76,0.9)',
            background: 'rgba(40,78,76,0.04)',
            '&:hover': { background: 'rgba(40,78,76,0.08)', borderColor: 'rgba(40,78,76,1)' }
          },
          '&.MuiButton-containedSecondary': {
            background: SECONDARY,
            color: '#0A0A0A',
            '&:hover': { background: '#FFCB37' }
          }
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          fontWeight: 500,
          '&.MuiChip-colorSuccess': { background: alpha(SUCCESS, 0.12), color: SUCCESS },
          '&.MuiChip-colorPrimary': { background: alpha(PRIMARY, 0.08), color: PRIMARY },
          '&.MuiChip-colorSecondary': { background: alpha(SECONDARY, 0.15), color: PRIMARY }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundImage: 'linear-gradient(180deg,#FFFFFF,#FCFCFC)',
          border: '1px solid #E0E0E0'
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            background: '#fff',
            '& fieldset': { borderColor: alpha('#0A0A0A', 0.12) },
            '&:hover fieldset': { borderColor: alpha('#0A0A0A', 0.28) },
            '&.Mui-focused fieldset': { borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }
          }
        })
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 10,
          fontSize: 12,
          background: '#111',
          letterSpacing: 0.3
        })
      }
    }
  }
});

export default theme;
