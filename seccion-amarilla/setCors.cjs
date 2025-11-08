// setCors.cjs
const { google } = require("googleapis");

async function setCors() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/devstorage.full_control"],
  });

  const storage = google.storage("v1");
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const bucketName = "seccionamarilla-5bbe2.firebasestorage.app";

  const corsConfig = [
    {
      origin: ["http://localhost:5173", "https://tudominio.com"],
      method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      responseHeader: ["Content-Type", "Authorization"],
      maxAgeSeconds: 3600,
    },
  ];

  const res = await storage.buckets.patch({
    bucket: bucketName,
    requestBody: { cors: corsConfig },
  });

  console.log("✅ CORS actualizado:", JSON.stringify(res.data, null, 2));
}

setCors().catch(console.error);
