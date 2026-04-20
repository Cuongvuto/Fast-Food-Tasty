// src/pages/AdminEditComboPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import ComboForm from "../components/admin/ComboForm";
import apiClient from "../API/axiosConfig";

function AdminEditComboPage() {
  const { comboId } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCombo = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/combos/${comboId}`);
        setInitialData(response.data.data);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Không thể tải thông tin combo để sửa.",
          severity: "error",
        });
        console.error("Lỗi tải combo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombo();
  }, [comboId]);

  const handleEditCombo = async (formData) => {
    // Đổi tên tham số thành formData cho dễ hiểu vì ComboForm truyền ra FormData
    setLoading(true);
    try {
      // 1. CHỈ CẦN GỬI THẲNG formData nhận được từ form đi
      // Không cần new FormData() hay append gì nữa vì ComboForm đã làm hết rồi!
      await apiClient.put(`/combos/${comboId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbar({
        open: true,
        message: "Cập nhật combo thành công!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/admin/combos");
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Cập nhật combo thất bại.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/admin/combos")}
          sx={{ mr: 1, bgcolor: "white", boxShadow: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "#111827" }}
        >
          Sửa Combo{" "}
          <Typography component="span" variant="h5" color="primary.main">
            #{comboId}
          </Typography>
        </Typography>
      </Box>

      {loading && !initialData ? (
        <Paper
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
            borderRadius: 3,
          }}
        >
          <CircularProgress size={50} thickness={4} />
        </Paper>
      ) : initialData ? (
        <ComboForm
          initialData={initialData}
          onSubmit={handleEditCombo}
          loading={loading}
        />
      ) : null}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminEditComboPage;
