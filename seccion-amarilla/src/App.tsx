// src/App.tsx
import { Container, Paper, Box } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import { LoadScript } from "@react-google-maps/api";


export default function App() {
  const { user, loading, role, signOutUser } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Cargando…
      </Box>
    );
  }

  if (!user) return <Login />;

  const userName = user.displayName || user.email || "Usuario";

  return (
<LoadScript
      googleMapsApiKey="AIzaSyBNB5O1QDYM-DYjrT1i6XRoCVRVmJkKY-k"
      libraries={["places"]}
    >
     
    

    <DashboardLayout userName={userName} role={role} handleLogout={signOutUser}>
      {/* Paper único, pegado arriba */}
      <Container maxWidth="lg" sx={{ mt: 0, pt: 0 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            // look elegante sobre tu degradado
            backdropFilter: "saturate(120%) blur(2px)",
          }}
        >
          <UserProfile />
        </Paper>
      </Container>
    </DashboardLayout>
    </LoadScript>
  );
}
