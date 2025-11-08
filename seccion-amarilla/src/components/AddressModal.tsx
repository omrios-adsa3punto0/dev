// src/components/AddressModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: { address: string; lat: number; lng: number }) => void;
  initialValue?: string;
}

export default function AddressModal({
  open,
  onClose,
  onSelect,
  initialValue = "",
}: AddressModalProps) {
  const [query, setQuery] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPlaces = async () => {
    if (!query || !window.google?.maps) {
      setErrorMsg("Google Maps no está listo. Intenta de nuevo.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setResults([]);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      service.textSearch({ query }, (res, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setResults(res || []);
        } else {
          setErrorMsg("No se encontraron direcciones");
        }
      });
    } catch (err) {
      console.error("Error buscando direcciones:", err);
      setErrorMsg("Error buscando direcciones");
      setLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    if (!place.geometry?.location) return;
    onSelect({
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Buscar dirección</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Dirección"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchPlaces()}
          sx={{ mb: 2 }}
        />

        {loading && <CircularProgress />}
        {errorMsg && <Typography color="error">{errorMsg}</Typography>}

        <List>
          {results.map((r, i) => (
            <ListItem
              button
              key={i}
              onClick={() => handleSelect(r)}
              sx={{ borderBottom: "1px solid #eee" }}
            >
              <ListItemText primary={r.formatted_address} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={fetchPlaces}>
          Buscar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
