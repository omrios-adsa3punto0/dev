// src/components/UserProfile.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { doc, onSnapshot, setDoc, serverTimestamp, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import ContractsList from "./ContractsList";
import DynamicWizard from "./DynamicWizard";

type RoleType = "admin" | "EST1" | "EST2" | "EST3" | "EST4" | "EST5" | "cliente";

const normalizeDigits = (v: string) => v.replace(/\D/g, "");
const isValidLada = (v: string) => /^\d{2,3}$/.test(v);
const isValidPhone = (v: string) => /^\d{10}$/.test(v);

export default function UserProfile() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [lada, setLada] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<RoleType>("cliente");
  const [accountId, setAccountId] = useState<string | null>(null);

  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" as "success" | "error" | "info" });

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; formTemplateId: string } | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);

  const userRef = useMemo(() => (uid ? doc(db, "users", uid) : null), [uid]);
  const isCorporateEmail = email.endsWith("@adn.com.mx") || email.endsWith("@seccionamarilla.com");
  const whatsappGuardado = isValidPhone(normalizeDigits(whatsapp));

  // 🔹 Cargar perfil de usuario
  useEffect(() => {
    if (!userRef || !user) return;
    const unsub = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      if (data) {
        setDisplayName(data.displayName ?? "");
        setEmail(data.email ?? "");
        setLada(data.lada ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setPhotoURL(data.photoURL ?? user.photoURL ?? null);
        setUserRole(data.role || "cliente");
        setAccountId(data.accountId || null);
      } else {
        setDisplayName(user.displayName ?? "");
        setEmail(user.email ?? "");
        setLada("");
        setWhatsapp("");
        setPhotoURL(user.photoURL ?? null);
        setUserRole("cliente");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [userRef, user]);

  // 🔹 Cargar lista de productos
  useEffect(() => {
    async function fetchProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items: any[] = [];
      snap.forEach((doc) => items.push(doc.data()));
      setProducts(items);
    }
    if (!isCorporateEmail) fetchProducts();
  }, [isCorporateEmail]);

  const handleSaveProfile = async () => {
    if (!userRef || !uid || !user) return;
    const ladaClean = normalizeDigits(lada);
    const waClean = normalizeDigits(whatsapp);

    if (!isValidLada(ladaClean)) {
      setToast({ open: true, msg: "La Lada País debe tener 2 o 3 dígitos.", sev: "error" });
      return;
    }
    if (!isValidPhone(waClean)) {
      setToast({ open: true, msg: "El WhatsApp debe tener 10 dígitos.", sev: "error" });
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      await setDoc(userRef, {
        uid,
        displayName,
        email,
        lada: ladaClean,
        whatsapp: waClean,
        role: isCorporateEmail ? userRole : "cliente",
        photoURL,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        accountId: accountId || uid, // 🔹 Vinculamos cuenta
      }, { merge: true });

      if (!accountId) setAccountId(uid);

      setToast({ open: true, msg: "Perfil guardado correctamente", sev: "success" });
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: "Error al guardar perfil", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleNewContract = () => {
    setEditingContractId(null);
    setSelectedProduct(null);
  };

const handleEditContract = async (contractId: string) => {
  if (!accountId) return;
  const contractRef = doc(db, "accounts", accountId, "contracts", contractId);
  const snap = await getDoc(contractRef);

  if (snap.exists()) {
    const data = snap.data();
    // Busca el producto en la lista de productos
    const product = products.find((p) => p.id === data.productId);

    if (product) {
      setSelectedProduct(product); // ✅ ahora el wizard recibe templateId correcto
    }
    setEditingContractId(contractId);
  }
};


  if (loading) {
    return <Box sx={{ p: 4, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Encabezado */}
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Avatar sx={{ width: 64, height: 64 }} src={photoURL || undefined}>
            {!photoURL && (displayName?.charAt(0) || "U")}
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Mi Perfil</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Perfil */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField label="Nombre" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField label="Email" value={email} fullWidth InputProps={{ readOnly: true }} />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField label="Lada País" value={lada} onChange={(e) => setLada(normalizeDigits(e.target.value))} fullWidth />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(normalizeDigits(e.target.value))} fullWidth />
        </Grid>
        {isCorporateEmail && (
          <Grid item xs={12} md={2}>
            <FormControl fullWidth disabled>
              <InputLabel>Rol</InputLabel>
              <Select value={userRole} onChange={(e) => setUserRole(e.target.value as RoleType)}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="EST1">Estación IC</MenuItem>
                <MenuItem value="EST2">Gráficos</MenuItem>
                <MenuItem value="EST3">QC</MenuItem>
                <MenuItem value="EST4">Parrilla</MenuItem>
                <MenuItem value="EST5">FB Ads</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={handleSaveProfile} disabled={saving} fullWidth>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </Grid>
      </Grid>

      {/* Contratos */}
      {!isCorporateEmail && whatsappGuardado && accountId && (
        <Box sx={{ mt: 4 }}>
          {!selectedProduct && !editingContractId && (
            <>
              <ContractsList
                accountId={accountId}
                onNewContract={handleNewContract}
                onEditContract={handleEditContract}
              />
              <Typography variant="h6" sx={{ mt: 3 }}>Selecciona un producto</Typography>
              <Grid container spacing={2}>
                {products.map((p: any) => (
                  <Grid item key={p.id} xs={12} md={4}>
                    <Button variant="outlined" fullWidth onClick={() => setSelectedProduct(p)}>
                      {p.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {(selectedProduct || editingContractId) && (
            <DynamicWizard
              templateId={selectedProduct?.formTemplateId || ""}
              productId={selectedProduct?.id || ""}
              accountId={accountId}
              contractId={editingContractId}
              onFinish={() => { setSelectedProduct(null); setEditingContractId(null); }}
            />
          )}
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
