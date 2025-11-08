// functions/middleware/authMiddleware.js
const admin = require('firebase-admin');
const { Pool } = require('pg');

// Inicializa Firebase Admin (solo una vez)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Crea el pool de conexión. ¡OJO! Asegúrate de que tu string de conexión
// esté disponible de la misma forma que en index.js (con dotenv y/o config)
const connectionString = process.env.GOOGLE_CLOUD_PROJECT
  ? require('firebase-functions').config().supabase.db
  : process.env.SUPABASE_CONNECTION_STRING;

const pool = new Pool({ connectionString });


const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'No autorizado: Token no proporcionado.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Ahora, busca el perfil del usuario en tu DB de Supabase
    const result = await pool.query('SELECT user_id, full_name, email, role FROM users WHERE user_id = $1', [uid]);

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Usuario no encontrado en nuestra base de datos.' });
    }
    
    // Adjuntamos el perfil completo al objeto request para usarlo en los siguientes pasos
    req.user = result.rows[0]; 
    
    next(); // El token es válido y el usuario existe, continuamos al siguiente manejador
  } catch (error) {
    console.error('Error verificando el token:', error);
    return res.status(403).send({ error: 'No autorizado: Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;