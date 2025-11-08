import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <--- 1. Importar useAuth

import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Box
} from '@mui/material';
import RoleBasedGuard from '../components/RoleBasedGuard';

const API_BASE_URL = "http://127.0.0.1:5001/adsa3punto0/us-central1/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); // <--- 2. Obtener el usuario actual del contexto

  useEffect(() => {
    // Solo intentar cargar los proyectos si tenemos un usuario autenticado
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        // 3. Obtener el token del usuario actual
        const idToken = await currentUser.getIdToken();
        
        // 4. Enviar el token en los headers de la petición
        const response = await axios.get(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        
        setProjects(response.data);
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
        setError("No se pudieron cargar los proyectos. Puede que no tengas permiso.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]); // <--- 5. Añadir currentUser como dependencia

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Proyectos Activos
        </Typography>
        
        <RoleBasedGuard allowedRoles={['DM_CONSULTANT', 'ADMIN']}>
          <Button variant="contained">
            Crear Nuevo Proyecto
          </Button>
        </RoleBasedGuard>
      </Box>

      {projects.length > 0 ? (
        <List>
          {projects.map((project) => (
            <ListItem key={project.project_id} divider>
              <ListItemText
                primary={project.project_name}
                secondary={`Estado: ${project.status} | Producto: ${project.bc_product || 'N/A'}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No se encontraron proyectos.</Typography>
      )}
    </>
  );
};

export default Projects;