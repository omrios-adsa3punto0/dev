// src/components/DynamicWizard.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Autocomplete,
  type AlertColor
} from "@mui/material";
import Grid from '@mui/material/Grid'; 

import { db } from "../firebaseConfig";
import { storage } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { useAuth } from "../contexts/AuthContext";
import { generateIAResponse } from "../services/gemini-generar";
import AddressModal from "./AddressModal";

interface DynamicWizardProps {
  templateId: string;
  productId: string;
  accountId: string;
  contractId?: string | null;
  onFinish: () => void;
}

export default function DynamicWizard({
  templateId,
  productId,
  accountId,
  contractId,
  onFinish,
}: DynamicWizardProps) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: AlertColor;
  }>({ open: false, msg: "", sev: "success" });

  const [loadingIAField, setLoadingIAField] = useState<string | null>(null);
  const [iaUsageCount, setIaUsageCount] = useState<Record<string, number>>({});
  const [sectors, setSectors] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

const [addressModalOpen, setAddressModalOpen] = useState(false);

  const isEdit = Boolean(contractId);

  // 📌 Cargar datos del usuario
  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) setUserData(snap.data());
    });
  }, [user]);

  // 📌 Cargar template
  useEffect(() => {
    if (!templateId) return;
    const templateRef = doc(db, "formTemplates", templateId);
    getDoc(templateRef).then((snap) => {
      if (snap.exists()) setTemplate(snap.data());
      setLoading(false);
    });
  }, [templateId]);

  // 📌 Cargar sectores
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const snap = await getDoc(doc(db, "catalogs", "sectors"));
        if (snap.exists()) {
          const items = snap.data().items || [];
          setSectors(items.sort((a: string, b: string) => a.localeCompare(b)));
        }
      } catch (err) {
        console.error("Error cargando sectores:", err);
      }
    };
    fetchSectors();
  }, []);

  // 📌 Cargar contrato en edición
  useEffect(() => {
    if (isEdit && contractId) {
      const contractRef = doc(
        db,
        "accounts",
        accountId,
        "contracts",
        contractId
      );
      getDoc(contractRef).then((snap) => {
        if (snap.exists()) {
          setFormValues(snap.data().values || {});
        }
      });
    }
  }, [isEdit, contractId, accountId]);

  const whatsappGuardado =
    userData?.whatsapp && /^\d{10}$/.test(userData.whatsapp);

  const handleChange = (fieldName: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: false }));
  };

  const handleGenerateIA = async (
    fieldName: string,
    promptExtra: string,
    maxChars = 700
  ) => {
    if ((iaUsageCount[fieldName] || 0) >= 3) return;
    try {
      setLoadingIAField(fieldName);
      const input = formValues[fieldName] || "";
      let result = await generateIAResponse(
        `Genera un texto descriptivo de negocio de 700 caracteres para: ${promptExtra}, solo dar 1 opción, no poerle nombre de negocio. Contexto: ${input}`
      );
      if (result.length > maxChars) {
        result = result.substring(0, maxChars) + "...";
      }
      handleChange(fieldName, result);
      setIaUsageCount((prev) => ({
        ...prev,
        [fieldName]: (prev[fieldName] || 0) + 1,
      }));
    } catch (err) {
      console.error("Error IA:", err);
      setToast({
        open: true,
        msg: "Error con el asistente SAI",
        sev: "error",
      });
    } finally {
      setLoadingIAField(null);
    }
  };

  // 📌 Validaciones de campos obligatorios
  const validateStep = () => {
    const step = template.steps[activeStep];
    const newErrors: Record<string, boolean> = {};
    let valid = true;

    step.fields.forEach((field: any) => {
      if (field.required && !formValues[field.name]) {
        newErrors[field.name] = true;
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (!validateStep()) {
      setToast({ open: true, msg: "Completa los campos obligatorios", sev: "error" });
      return;
    }
    setActiveStep((p) => p + 1);
  };

  const handleSave = async () => {
    if (!validateStep()) {
      setToast({ open: true, msg: "Completa los campos obligatorios", sev: "error" });
      return;
    }
    if (!user?.uid || !accountId) return;
    setSaving(true);
    try {
      if (isEdit && contractId) {
        await setDoc(
          doc(db, "accounts", accountId, "contracts", contractId),
          { productId, values: formValues, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } else {
        await addDoc(collection(db, "accounts", accountId, "contracts"), {
          productId,
          values: formValues,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setToast({
        open: true,
        msg: "Contrato guardado con éxito",
        sev: "success",
      });
      onFinish();
    } catch (err) {
      console.error("Error guardando contrato:", err);
      setToast({ open: true, msg: "Error al guardar", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!whatsappGuardado) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Primero completa tu perfil con un número de WhatsApp válido.
      </Typography>
    );
  }

  if (!template) {
    return (
      <Typography color="error">
        No se encontró el template {templateId}.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3, flexWrap: "wrap" }}>
        {template.steps.map((step: any) => (
          <Step key={step.step}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={2}>
        {template.steps[activeStep].fields.map((field: any) => (
          <Grid item xs={12} key={field.name}>
            {field.name === "sector" ? (
              <Autocomplete
                freeSolo
                options={sectors}
                value={formValues[field.name] || ""}
                onInputChange={(_, val) => handleChange(field.name, val || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={field.label}
                    fullWidth
                    required={field.required}
                    error={!!errors[field.name]}
                    helperText={errors[field.name] ? "Campo requerido" : ""}
                  />
                )}
              />

) : field.type === "file" ? (
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  {formValues[field.name] ? "Cambiar archivo" : "Subir archivo"}
                  <input
                    type="file"
                    hidden
                    accept={field.accept || "*/*"}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setLoadingIAField(field.name);
                        const fileRef = ref(
                          storage,
                          `contracts/${accountId}/${contractId || "new"}/${field.name}_${Date.now()}`
                        );
                        await uploadBytes(fileRef, file);
                        const url = await getDownloadURL(fileRef);

                        handleChange(field.name, url);
                        setToast({ open: true, msg: "Archivo subido con éxito", sev: "success" });
                      } catch (err) {
                        console.error("Error subiendo archivo:", err);
                        setToast({ open: true, msg: "Error al subir archivo", sev: "error" });
                      } finally {
                        setLoadingIAField(null);
                      }
                    }}
                  />
                </Button>
                {formValues[field.name] && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Archivo:{" "}
                    <a href={formValues[field.name]} target="_blank" rel="noopener noreferrer">
                      Ver archivo
                    </a>
                  </Typography>
                )}
              </Box>



            ) : field.name === "direccion" ? (
              <>
               <TextField
      label={field.label}
      value={formValues[field.name]?.address || ""}
      onClick={() => setAddressModalOpen(true)}
      fullWidth
      required={field.required}
      placeholder="Haz clic para buscar dirección"
      InputProps={{ readOnly: true }}
    />
    <AddressModal
      open={addressModalOpen}
      initialValue={formValues[field.name]?.address || ""}
      onClose={() => setAddressModalOpen(false)}
      onSelect={(data) => handleChange(field.name, data)}
    />
  </>
) : (
              <TextField
                label={field.label}
                type={field.type}
                value={formValues[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                fullWidth
                required={field.required}
                error={!!errors[field.name]}
                helperText={errors[field.name] ? "Campo requerido" : ""}
                multiline={!!field.iaAssist}
                minRows={field.iaAssist ? 4 : 1}
                inputProps={{ maxLength: 500 }}
              />
            )}

            {field.iaAssist && (
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => handleGenerateIA(field.name, field.label, 500)}
                disabled={
                  loadingIAField === field.name ||
                  (iaUsageCount[field.name] || 0) >= 3
                }
              >
                {loadingIAField === field.name ? (
                  <CircularProgress size={18} />
                ) : (
                  "Asistente SAI"
                )}
              </Button>
            )}
          </Grid>
        ))}
      </Grid>

{/* Botón para regresar a la lista de contratos */}
<Box sx={{ mb: 2 }}>
  <Button
    variant="text"
    color="secondary"
    onClick={onFinish}
  >
    ← Regresar a contratos
  </Button>
</Box>


      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((p) => p - 1)}
          variant="outlined"
        >
          Atrás
        </Button>
        {activeStep < template.steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        )}
      </Box>

      

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.sev}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
