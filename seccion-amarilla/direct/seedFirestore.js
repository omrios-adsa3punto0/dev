/**
 * Script para poblar Firestore con productos, templates, accounts y contracts iniciales
 * Ejecutar con: node seedFirestore.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// 1️⃣ Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_HR2RraZTrvVVa8qCL6ZOOTSIlsjxbr8",
  authDomain: "seccionamarilla-5bbe2.firebaseapp.com",
  projectId: "seccionamarilla-5bbe2",
  storageBucket: "seccionamarilla-5bbe2.firebasestorage.app",
  messagingSenderId: "911299869010",
  appId: "1:911299869010:web:10f7291975f1f2a1c8a28b"
};

// 2️⃣ Leer el JSON manualmente
const templateFormularioMaestro = JSON.parse(
  fs.readFileSync("./template_formulario_maestro.json", "utf-8")
);

// 3️⃣ Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4️⃣ Subir datos
async function seedData() {
  try {
    await setDoc(doc(db, "formTemplates", templateFormularioMaestro.id), templateFormularioMaestro);
    console.log(`✅ Template cargado: ${templateFormularioMaestro.name}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
    process.exit(1);
  }
}

seedData();
