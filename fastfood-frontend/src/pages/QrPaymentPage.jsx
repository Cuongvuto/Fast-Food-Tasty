import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Container,
  Grid,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

// 1. IMPORT hook useCart từ CartContext của bạn
import { useCart } from "../context/CartContext";

function QrPaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // 2. LẤY HÀM clearCart TỪ CONTEXT
  const { clearCart } = useCart();

  // 1. LẤY VÀ XỬ LÝ DỮ LIỆU TỪ URL
  const orderId = params.get("orderId") || "UNKNOWN";
  const rawAmount = params.get("amount") || "0";
  const cleanAmount = rawAmount.replace(/\D/g, "");

  // 2. CẤU HÌNH THÔNG TIN TÀI KHOẢN NGÂN HÀNG
  const bank = "MB";
  const account = "0523012949";
  const accountName = "VU DUY CUONG";
  const transferContent = `DH${orderId}`;

  // 3. TẠO LINK ẢNH QR TỪ API VIETQR
  const qrUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${cleanAmount}&addInfo=${transferContent}&accountName=${encodeURIComponent(accountName)}`;

  // 4. XỬ LÝ KHI BẤM NÚT XÁC NHẬN
  const handleConfirm = () => {
    // Gọi hàm clearCart để xóa giỏ hàng và reset state
    clearCart();

    // Chuyển hướng sang trang kết quả
    navigate(`/payment-result?vnp_ResponseCode=00&vnp_TxnRef=${orderId}`);
  };

  // Xử lý copy text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setOpenSnackbar(true);
  };

  // Component con để hiển thị từng dòng thông tin
  const InfoRow = ({ label, value, copyable }) => (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      py={1}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          {value}
        </Typography>
        {copyable && (
          <Tooltip title="Sao chép">
            <IconButton
              size="small"
              onClick={() => handleCopy(value)}
              color="primary"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: "#f4f6f8", py: 4 }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: 0,
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid #e0e0e0",
          }}
        >
          {/* --- HEADER --- */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              py: 2,
              px: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Thanh toán đơn hàng
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Mã đơn: #{orderId}
            </Typography>
          </Box>

          {/* --- BODY --- */}
          <Grid container>
            {/* CỘT TRÁI: MÃ QR */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: 3,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRight: { md: "1px solid #e0e0e0", xs: "none" },
                borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="medium"
                gutterBottom
              >
                Quét mã bằng ứng dụng ngân hàng
              </Typography>

              <Box
                sx={{
                  display: "inline-block",
                  p: 1.5,
                  border: "2px dashed #1976d2",
                  borderRadius: 2,
                  mt: 2,
                  mb: 2,
                  backgroundColor: "#fff",
                }}
              >
                <img
                  src={qrUrl}
                  alt="Mã QR Thanh Toán"
                  width="220"
                  style={{ display: "block" }}
                />
              </Box>

              <Typography
                variant="body2"
                color="primary.main"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <QrCodeScannerIcon fontSize="small" />
                Hỗ trợ hầu hết các App Ngân hàng
              </Typography>
            </Grid>

            {/* CỘT PHẢI: CHI TIẾT & NÚT XÁC NHẬN */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{ p: 4, display: "flex", flexDirection: "column" }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Số tiền cần thanh toán
              </Typography>
              <Typography
                variant="h3"
                color="error.main"
                fontWeight="bold"
                gutterBottom
              >
                {Number(cleanAmount).toLocaleString("vi-VN")} đ
              </Typography>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Thông tin chuyển khoản thủ công
                </Typography>
              </Divider>

              {/* Khung thông tin */}
              <Box
                sx={{
                  textAlign: "left",
                  bgcolor: "#f9f9f9",
                  p: 2,
                  borderRadius: 2,
                  mb: 4,
                  flexGrow: 1,
                }}
              >
                <InfoRow
                  label="Ngân hàng"
                  value="MB BANK (MB)"
                  copyable={false}
                />
                <Divider sx={{ my: 0.5 }} />
                <InfoRow
                  label="Chủ tài khoản"
                  value={accountName}
                  copyable={false}
                />
                <Divider sx={{ my: 0.5 }} />
                <InfoRow label="Số tài khoản" value={account} copyable={true} />
                <Divider sx={{ my: 0.5 }} />
                <InfoRow
                  label="Nội dung"
                  value={transferContent}
                  copyable={true}
                />
              </Box>

              {/* Nút giả lập thành công */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<CheckCircleOutlineIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1.05rem",
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: 3,
                }}
                onClick={handleConfirm}
              >
                Tôi đã chuyển khoản thành công
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* --- THÔNG BÁO COPY --- */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Đã sao chép vào khay nhớ tạm!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default QrPaymentPage;
