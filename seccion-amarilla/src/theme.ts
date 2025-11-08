// theme.ts
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    secondary: { main: "#FFB703" },
    background: { default: "#ffffff", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          /* De amarillo (abajo-derecha) a blanco (arriba-izquierda) */
          background: [
            "linear-gradient(" +
              "to top ," +
              " #FFB703 0%," +   // amarillo principal
              " #FFFFFF 22%," +  // amarillo suave
              " #FFFFFF 48%," +  // arena claro
              " #FFFFFF 75%," +  // marfil cálido
              " #FFFFFF 100%" +  // blanco elegante
            ")",
          ].join(", "),
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        },
      },
    },
  },
});


export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8AB4F8' },
    secondary: { main: '#FFD166' },
    background: { default: '#0f1115', paper: '#141821' },
  },
  shape: { borderRadius: 12 },
});