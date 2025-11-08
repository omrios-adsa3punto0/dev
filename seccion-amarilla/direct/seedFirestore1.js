
/**
 * Script para poblar Firestore con catálogo de sectores populares en México
 * Ejecutar: node seedFirestore1.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// 1️⃣ Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_HR2RraZTrvVVa8qCL6ZOOTSIlsjxbr8",
  authDomain: "seccionamarilla-5bbe2.firebaseapp.com",
  projectId: "seccionamarilla-5bbe2",
  storageBucket: "seccionamarilla-5bbe2.firebasestorage.app",
  messagingSenderId: "911299869010",
  appId: "1:911299869010:web:10f7291975f1f2a1c8a28b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Datos de sectores
const sectors = {
  items: [
    "Restaurante",
    "Cafetería",
    "Tienda de abarrotes",
    "Supermercado",
    "Panadería",
    "Taquería",
    "Pizzería",
    "Farmacia",
    "Clínica médica",
    "Hospital",
    "Dentista",
    "Veterinaria",
    "Escuela primaria",
    "Secundaria",
    "Preparatoria",
    "Universidad",
    "Despacho contable",
    "Abogado",
    "Notaría",
    "Tienda de ropa",
    "Zapatería",
    "Tienda de electrónicos",
    "Ferretería",
    "Gasolinera",
    "Taller mecánico",
    "Lavandería",
    "Hotel",
    "Agencia de viajes",
    "Inmobiliaria",
    "Gimnasio",
    "Spa",
    "Peluquería",
    "Barbería",
    "Bar",
    "Cervecería",
    "Centro comercial",
    "Papelería",
    "Librería",
    "Joyería",
    "Florería",
    "Parque de diversiones",
    "Cine",
    "Museo",
    "Parque público"
  ]
};

// 🔹 Cargar en Firestore
async function seedSectors() {
  try {
    await setDoc(doc(db, "catalogs", "sectors"), sectors);
    console.log("✅ Catálogo de sectores cargado correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cargando catálogo:", error);
    process.exit(1);
  }
}

seedSectors();
