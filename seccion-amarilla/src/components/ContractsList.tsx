// src/components/ContractsList.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Pagination
} from "@mui/material";

import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
  startAfter
} from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Contract {
  id: string;
  productId: string;
  values: any;
  createdAt?: { seconds: number; nanoseconds: number };
}

interface ContractsListProps {
  accountId: string;
  onNewContract: () => void;
  onEditContract: (contractId: string) => void;
}

export default function ContractsList({
  accountId,
  onNewContract,
  onEditContract
}: ContractsListProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]); // ✅ faltaba este estado
  const [page, setPage] = useState(1);
  const [lastVisibleDocs, setLastVisibleDocs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const PAGE_SIZE = 5;

  const fetchContracts = async (pageNum: number) => {
    if (!accountId) return;
    setLoading(true);

    let q;
    if (pageNum === 1) {
      q = query(
        collection(db, "accounts", accountId, "contracts"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
    } else {
      q = query(
        collection(db, "accounts", accountId, "contracts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisibleDocs[pageNum - 2]),
        limit(PAGE_SIZE)
      );
    }

    const snap = await getDocs(q);
    const items: Contract[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Contract);
    });

    if (pageNum === 1) {
      setLastVisibleDocs([snap.docs[snap.docs.length - 1]]);
    } else {
      const updatedLastDocs = [...lastVisibleDocs];
      updatedLastDocs[pageNum - 1] = snap.docs[snap.docs.length - 1];
      setLastVisibleDocs(updatedLastDocs);
    }

    setContracts(items);
    setHasMore(items.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountId]);

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography variant="h6">Contratos</Typography>
        <Button variant="contained" onClick={onNewContract}>
          + Nuevo Contrato
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : contracts.length === 0 ? (
        <Typography color="text.secondary">No hay contratos registrados.</Typography>
      ) : (
        <Grid container spacing={2}>
          {contracts.map((c) => (
            <Grid xs={12} md={6} key={c.id}> 
              <Card
                variant="outlined"
                sx={{ cursor: "pointer" }}
                onClick={() => onEditContract(c.id)}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Producto: {c.productId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Creado: {formatDate(c.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {c.values?.nombre_negocio || "Sin nombre de negocio"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {contracts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={hasMore ? page + 1 : page}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}
    </Box>
  );
}
