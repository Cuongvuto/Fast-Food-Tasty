// src/pages/AdminCombosPage.jsx
import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Snackbar, Alert, TextField, InputAdornment, Tooltip, Avatar // <--- Thêm Avatar vào đây
} from '@mui/material';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import apiClient from "../API/axiosConfig";
import { getImageUrl } from "../utils/imageHelper";

function AdminCombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Notifications & Dialog
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialogOpen] = useState({
    open: false,
    comboId: null,
  });

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/combos/admin");
      setCombos(response.data.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách combo.",
        severity: "error",
      });
      console.error("Lỗi tải combo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const confirmDelete = async () => {
    if (!deleteDialog.comboId) return;
    try {
      await apiClient.delete(`/combos/${deleteDialog.comboId}`);
      setSnackbar({
        open: true,
        message: "Xóa combo thành công!",
        severity: "success",
      });
      fetchCombos();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Xóa combo thất bại.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen({ open: false, comboId: null });
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredCombos = combos.filter((combo) =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box sx={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "#2C2C2C" }}
        >
          Quản Lý Combo
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate("/admin/combos/add")}
          sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1 }}
        >
          Thêm Combo Mới
        </Button>
      </Box>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          borderRadius: 3,
        }}
      >
        {/* Thanh Công Cụ (Toolbar của Table) */}
        <Box sx={{ p: 2, display: "flex", borderBottom: "1px solid #f0f0f0" }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm combo theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 8, bgcolor: "#f9f9f9", minWidth: 300 },
            }}
          />
        </Box>

        <TableContainer sx={{ maxHeight: "calc(100vh - 250px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    bgcolor: "#F3F4F6",
                    color: "#4B5563",
                  },
                }}
              >
                <TableCell width="80">ID</TableCell>
                <TableCell width="100">Hình Ảnh</TableCell>
                <TableCell>Tên Combo</TableCell>
                <TableCell align="right">Giá Bán</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell align="center" width="120">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredCombos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 5, color: "text.secondary" }}
                  >
                    Không tìm thấy combo nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCombos.map((combo) => (
                  <TableRow hover key={combo.id}>
                    <TableCell
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      #{combo.id}
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={getImageUrl(combo.image_url)}
                        alt={combo.name}
                        variant="rounded"
                        sx={{
                          width: 50,
                          height: 50,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                      {combo.name}
                      {combo.discount_amount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "error.main" }}
                        >
                          Giảm{" "}
                          {parseInt(combo.discount_amount).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {parseInt(combo.price).toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          combo.is_available ? (
                            <CheckCircleIcon />
                          ) : (
                            <CancelIcon />
                          )
                        }
                        label={combo.is_available ? "Đang bán" : "Đã ẩn"}
                        color={combo.is_available ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            navigate(`/admin/combos/edit/${combo.id}`)
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          onClick={() =>
                            setDeleteDialogOpen({
                              open: true,
                              comboId: combo.id,
                            })
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Xác nhận Xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialogOpen({ open: false, comboId: null })}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          Xác nhận xóa Combo
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa Combo <b>#{deleteDialog.comboId}</b> này
            không? Hành động này sẽ làm ẩn combo khỏi hệ thống.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen({ open: false, comboId: null })}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disableElevation
          >
            Xóa Combo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminCombosPage;
