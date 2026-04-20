// src/pages/CartPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  Button,
  IconButton,
  Stack,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import apiClient from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageHelper";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, addToCart } = useCart();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [suggestedDrinks, setSuggestedDrinks] = useState([]);

  const sliderRef = useRef(null);

  const orangeColor = "#f97316";
  const orangeHover = "#ea580c";
  const kfcRed = "#e3002b";

  // 👉 ĐÃ SỬA: Ép kiểu nghiêm ngặt về số để chấm dứt vĩnh viễn lỗi NaN
  const totalPrice = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + price * quantity;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => {
    const quantity = Number(item.quantity) || 1;
    return total + quantity;
  }, 0);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await apiClient.get("/products/category/3", {
          params: { limit: 10 },
        });
        if (response.data && response.data.data) {
          setSuggestedDrinks(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải đồ uống gợi ý:", error);
      }
    };
    fetchDrinks();
  }, []);

  const handleDeleteClick = (item) => {
    setDeleteDialog({ open: true, item });
  };

  const confirmDelete = () => {
    removeFromCart(deleteDialog.item.id);
    setDeleteDialog({ open: false, item: null });
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      navigate("/checkout");
      setCheckoutLoading(false);
    }, 1000);
  };

  // 👉 ĐÃ SỬA: Bọc dữ liệu cẩn thận trước khi ném vào Context
  const handleAddSuggested = (drink) => {
    if (addToCart) {
      const safeDrink = {
        ...drink,
        price: Number(drink.price) || 0, // Khử chuỗi API
        quantity: 1, // Ép cứng số lượng cơ bản
      };

      // Truyền cả 2 tham số để phòng hờ CartContext bắt buộc cấu trúc (item, quantity)
      addToCart(safeDrink, 1);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
        <Typography
          variant="h5"
          sx={{ mb: 2, color: "text.secondary", fontWeight: "bold" }}
        >
          Giỏ hàng của bạn đang trống.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/menu")}
          sx={{
            bgcolor: orangeColor,
            borderRadius: 8,
            px: 4,
            "&:hover": { bgcolor: orangeHover },
          }}
        >
          Khám phá menu
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 4, fontWeight: 800, textTransform: "uppercase" }}
        >
          Giỏ hàng của tôi
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 2fr) minmax(0, 1fr)",
            },
            gap: 4,
            alignItems: "start",
          }}
        >
          {/* KHỐI TRÁI: DANH SÁCH SẢN PHẨM & GỢI Ý */}
          <Box sx={{ width: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                mb: 4,
                border: "1px solid #e0e0e0",
                width: "100%",
              }}
            >
              {cartItems.map((item, index) => {
                // Tính toán biến phụ trợ chống lỗi cục bộ cho từng item
                const safePrice = Number(item.price) || 0;
                const safeQuantity = Number(item.quantity) || 1;

                return (
                  <Box key={item.id}>
                    <Box sx={{ display: "flex", p: 3, alignItems: "center" }}>
                      <CardMedia
                        component="img"
                        image={
                          getImageUrl(item.image_url) ||
                          "https://via.placeholder.com/100"
                        }
                        alt={item.name}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          objectFit: "cover",
                          mr: 3,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", mb: 0.5 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {safePrice.toLocaleString("vi-VN")}đ
                        </Typography>
                        <Button
                          size="small"
                          sx={{
                            p: 0,
                            minWidth: "auto",
                            textTransform: "none",
                            fontWeight: "bold",
                            color: orangeColor,
                          }}
                          onClick={() => handleDeleteClick(item)}
                        >
                          Xóa
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {(safePrice * safeQuantity).toLocaleString("vi-VN")}đ
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{ border: "1px solid #ccc", borderRadius: 5 }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity &&
                              updateQuantity(item.id, safeQuantity - 1)
                            }
                            disabled={safeQuantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 2, fontWeight: "bold" }}>
                            {safeQuantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity &&
                              updateQuantity(item.id, safeQuantity + 1)
                            }
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Box>
                    {index < cartItems.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Paper>

            {/* Block: Sẽ ngon hơn khi thưởng thức cùng */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#333333",
                color: "white",
                p: 2,
                borderRadius: 2,
                width: "100%",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  mb: 1.5,
                  fontSize: "0.9rem",
                }}
              >
                Sẽ ngon hơn khi thưởng thức cùng...
              </Typography>

              <Box
                ref={sliderRef}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  overflowX: "auto",
                  width: "100%",
                  pb: 1,
                  "&::-webkit-scrollbar": { height: "6px" },
                  "&::-webkit-scrollbar-track": {
                    background: "#555",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": { background: "#aaa" },
                }}
              >
                {suggestedDrinks.map((drink) => (
                  <Card
                    key={drink.id}
                    sx={{
                      minWidth: 110,
                      width: 110,
                      height: 150,
                      flexShrink: 0,
                      borderRadius: 2,
                      position: "relative",
                      boxShadow: "none",
                      bgcolor: "white",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={
                        getImageUrl(drink.image_url) ||
                        "https://via.placeholder.com/140"
                      }
                      alt={drink.name}
                      sx={{ height: "100%", width: "100%", objectFit: "cover" }}
                    />

                    <IconButton
                      onClick={() => handleAddSuggested(drink)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: kfcRed,
                        color: "white",
                        width: 28,
                        height: 28,
                        "&:hover": { bgcolor: "#b00020" },
                        boxShadow: 2,
                      }}
                    >
                      <AddIcon sx={{ fontSize: 20 }} />
                    </IconButton>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                        p: 1.5,
                        pt: 4,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          lineHeight: 1.2,
                          mb: 0.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {drink.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#ccc", fontWeight: "bold" }}
                      >
                        {(Number(drink.price) || 0).toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* KHỐI PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <Box sx={{ width: "100%", position: "sticky", top: 20 }}>
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                {totalItems} MÓN
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                  Bạn có Mã giảm giá?
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Mã giảm giá *"
                    variant="standard"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#000",
                      color: "#fff",
                      "&:hover": { bgcolor: "#333" },
                      borderRadius: 8,
                      px: 3,
                    }}
                  >
                    Áp dụng
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body1" color="text.secondary">
                  Tổng đơn hàng
                </Typography>
                <Typography variant="body1">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Tổng thanh toán
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: kfcRed }}
                >
                  {totalPrice.toLocaleString("vi-VN")}đ
                </Typography>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                sx={{
                  bgcolor: kfcRed,
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 8,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  "&:hover": { bgcolor: "#b00020" },
                  "&:disabled": { opacity: 0.7 },
                }}
              >
                {checkoutLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Thanh toán ${totalPrice.toLocaleString("vi-VN")}đ`
                )}
              </Button>
            </Paper>
          </Box>
        </Box>

        {/* Dialog xác nhận xóa */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, item: null })}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>Xác nhận xóa</DialogTitle>
          <DialogContent>
            Bạn có chắc muốn xóa "{deleteDialog.item?.name}" khỏi giỏ hàng?
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, item: null })}
              sx={{ color: "text.secondary" }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDelete}
              sx={{ color: orangeColor, fontWeight: "bold" }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default CartPage;
