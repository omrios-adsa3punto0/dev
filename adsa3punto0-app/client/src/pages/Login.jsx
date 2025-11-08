// src/pages/Login.jsx 
import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // La redirección se manejará automáticamente por el router
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            fullWidth
          >
            Continuar con Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;