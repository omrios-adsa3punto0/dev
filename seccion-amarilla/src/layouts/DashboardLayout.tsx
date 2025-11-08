// src/layouts/DashboardLayout.tsx
import React, { useState, useMemo, useEffect, createContext } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemIcon, ListItemText, CssBaseline, ListItemButton, Tooltip,
  Switch, Avatar, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkHistoryRoundedIcon from '@mui/icons-material/WorkHistoryRounded';
import QCIcon from '@mui/icons-material/CheckCircle';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CableIcon from '@mui/icons-material/Cable';
import CachedIcon from '@mui/icons-material/Cached';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { logEvent } from 'firebase/analytics';
import { analyticsPromise } from "../firebaseConfig";
import { useAuth } from "../contexts/AuthContext"; 



const drawerWidth = 240;
const miniDrawerWidth = 60;

export const ThemeModeContext = createContext({
  toggleThemeMode: () => {},
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  role: string;
  handleLogout: () => void;
}



  const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userName, role, handleLogout }) => {
  const { user } = useAuth(); // obtenemos el usuario de Firebase
  const photoURL = user?.photoURL ?? null;



  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('themeMode') === 'dark' ? 'dark' : 'light'));

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

  const toggleThemeMode = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
localStorage.setItem("themeMode", newTheme);

  analyticsPromise.then((a) => {
    if (a) logEvent(a, "theme_change", { theme: newTheme, userName });
  });
};

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleSidebar = () => setIsSidebarOpen((o) => !o);

const handleNavigation = (path: string) => {
  analyticsPromise.then((a) => {
    if (a) logEvent(a, "navigation", { path, userRole: role, userName });
  });
  navigate(path);
};


  return (
    <ThemeModeContext.Provider value={{ toggleThemeMode }}>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <CssBaseline />

          {/* Header */}
          <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggleSidebar}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


                
                 <Avatar src={photoURL || undefined}>
            {!photoURL && (userName?.charAt(0) ?? '?')}
          </Avatar>
                <Typography variant="h6" noWrap>Bienvenido {userName}</Typography>
              </Box>
              <Box>
                <Switch checked={themeMode === 'dark'} onChange={toggleThemeMode} />
                <IconButton color="inherit" onClick={handleLogout}>
  <ExitToAppIcon />
</IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Sidebar */}
          <Drawer
            variant="permanent"
            open={isSidebarOpen}
            sx={{
              width: isSidebarOpen ? drawerWidth : miniDrawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: isSidebarOpen ? drawerWidth : miniDrawerWidth,
                boxSizing: 'border-box',
                overflowX: 'hidden',
                transition: (t) => t.transitions.create('width', { easing: t.transitions.easing.sharp, duration: t.transitions.duration.enteringScreen }),
              },
            }}
          >
            <Toolbar />
            <List>
              {(role === 'EST1' || role === 'EST4' || role === 'admin') && (
                <Tooltip title={!isSidebarOpen ? 'Estación IC' : ''} placement="right" arrow>
                  <ListItemButton selected={location.pathname === '/app'} onClick={() => handleNavigation('/app')}>
                    <ListItemIcon><ContactPhoneRoundedIcon /></ListItemIcon>
                    {isSidebarOpen && <ListItemText primary="Estación IC" />}
                  </ListItemButton>
                </Tooltip>
              )}

              {(role === 'EST2' || role === 'admin') && (
                <Tooltip title={!isSidebarOpen ? 'Gráficos' : ''} placement="right" arrow>
                  <ListItemButton selected={location.pathname === '/app-est2'} onClick={() => handleNavigation('/app-est2')}>
                    <ListItemIcon><BrushRoundedIcon /></ListItemIcon>
                    {isSidebarOpen && <ListItemText primary="Gráficos" />}
                  </ListItemButton>
                </Tooltip>
              )}

              {(role === 'EST3' || role === 'admin') && (
                <Tooltip title={!isSidebarOpen ? 'Estación QC' : ''} placement="right" arrow>
                  <ListItemButton selected={location.pathname === '/app-est3'} onClick={() => handleNavigation('/app-est3')}>
                    <ListItemIcon><QCIcon /></ListItemIcon>
                    {isSidebarOpen && <ListItemText primary="Estación QC" />}
                  </ListItemButton>
                </Tooltip>
              )}

              {(role === 'EST1' || role === 'EST4' || role === 'admin') && (
                <Tooltip title={!isSidebarOpen ? 'Estación Parrilla' : ''} placement="right" arrow>
                  <ListItemButton selected={location.pathname === '/app-est4'} onClick={() => handleNavigation('/app-est4')}>
                    <ListItemIcon><WorkHistoryRoundedIcon /></ListItemIcon>
                    {isSidebarOpen && <ListItemText primary="Estación Parrilla" />}
                  </ListItemButton>
                </Tooltip>
              )}

              {(role === 'EST5' || role === 'admin') && (
                <Tooltip title={!isSidebarOpen ? 'Estación Fb Ads' : ''} placement="right" arrow>
                  <ListItemButton selected={location.pathname === '/app-est8'} onClick={() => handleNavigation('/app-est8')}>
                    <ListItemIcon><FacebookIcon /></ListItemIcon>
                    {isSidebarOpen && <ListItemText primary="Estación Fb Ads" />}
                  </ListItemButton>
                </Tooltip>
              )}

              {/* Estación 5 - visible a todos */}
              <Tooltip title={!isSidebarOpen ? 'Estatus Social Content' : ''} placement="right" arrow>
                <ListItemButton selected={location.pathname === '/app-est5'} onClick={() => handleNavigation('/app-est5')}>
                  <ListItemIcon><VisibilityIcon /></ListItemIcon>
                  {isSidebarOpen && <ListItemText primary="Estatus Social Content" />}
                </ListItemButton>
              </Tooltip>

              <Divider />

              {role === 'admin' && (
                <>
                  <Tooltip title={!isSidebarOpen ? 'Users' : ''} placement="right" arrow>
                    <ListItemButton selected={location.pathname === '/app-est6'} onClick={() => handleNavigation('/app-est6')}>
                      <ListItemIcon><CableIcon /></ListItemIcon>
                      {isSidebarOpen && <ListItemText primary="Admin Users" />}
                    </ListItemButton>
                  </Tooltip>

                  <Tooltip title={!isSidebarOpen ? 'Re-asignación' : ''} placement="right" arrow>
                    <ListItemButton selected={location.pathname === '/app-est7'} onClick={() => handleNavigation('/app-est7')}>
                      <ListItemIcon><CachedIcon /></ListItemIcon>
                      {isSidebarOpen && <ListItemText primary="Re-asignación" />}
                    </ListItemButton>
                  </Tooltip>

                  <Tooltip title={!isSidebarOpen ? 'Re-asignación' : ''} placement="right" arrow>
                    <ListItemButton selected={location.pathname === '/app-est9'} onClick={() => handleNavigation('/app-est9')}>
                      <ListItemIcon><CachedIcon /></ListItemIcon>
                      {isSidebarOpen && <ListItemText primary="Re-asignación" />}
                    </ListItemButton>
                  </Tooltip>
                </>
              )}
            </List>
          </Drawer>

          {/* Main */}
          <Box component="main" sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            ml: isSidebarOpen ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
            transition: (t) => t.transitions.create('margin-left', { easing: t.transitions.easing.sharp, duration: t.transitions.duration.enteringScreen }),
            p: 3,
          }}>
            <Toolbar />
            {children}
            <Box sx={{ mt: 3 }}>
              
              
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ textAlign: 'center', py: 2, mt: 'auto', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2">© 2025 - Todos los derechos reservados.</Typography>
        </Box>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default DashboardLayout;