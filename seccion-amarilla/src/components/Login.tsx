// src/components/Login.tsx
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Inicia sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa tu cuenta de Google para entrar.
          </Typography>
          <Button variant="contained" onClick={signInWithGoogle}>
            Continuar con Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
