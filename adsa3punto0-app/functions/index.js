const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const authMiddleware = require('./middleware/authMiddleware');

// --- INICIO DE LA MODIFICACIÓN ---

// Verificar si estamos corriendo en el emulador local
// La variable de entorno GOOGLE_CLOUD_PROJECT no existe en el emulador
if (!process.env.GOOGLE_CLOUD_PROJECT) {
    // Si estamos en local, cargar las variables del archivo .env
    require("dotenv").config();
}

// Lógica para obtener el string de conexión
// Si estamos en producción, usa functions.config()
// Si estamos en local, usa process.env
const supabaseConnectionString = process.env.GOOGLE_CLOUD_PROJECT 
    ? functions.config().supabase.db 
    : process.env.SUPABASE_CONNECTION_STRING;

// --- FIN DE LA MODIFICACIÓN ---


// Inicializar la app de Express
const app = express();
app.use(cors({ origin: true }));

// Comprobar si tenemos el string de conexión antes de crear el Pool
if (!supabaseConnectionString) {
    console.error("Error: La cadena de conexión de Supabase no está definida.");
    // Podrías lanzar un error aquí para evitar que la función se despliegue incorrectamente
}

// Configurar el pool de conexión a Supabase/PostgreSQL
const pool = new Pool({
    connectionString: supabaseConnectionString,
});

// ----- NUESTRO PRIMER ENDPOINT -----
app.get("/projects", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM projects ORDER BY project_id DESC;");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).send("Error interno del servidor");
    }
});


// ----- NUEVO ENDPOINT PARA OBTENER EL PERFIL DEL USUARIO -----
// Lo protegemos con nuestro nuevo middleware
app.get("/users/me", authMiddleware, (req, res) => {
  // Gracias al middleware, req.user ya contiene el perfil del usuario de nuestra DB
  res.status(200).json(req.user);
});

// Exponer la app de Express como una única Cloud Function llamada "api"
exports.api = functions.https.onRequest(app);