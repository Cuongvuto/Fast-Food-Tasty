// src/components/admin/ComboForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  IconButton,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import apiClient from "../../API/axiosConfig";

function ComboForm({ initialData = null, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [discountAmount, setDiscountAmount] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [priceError, setPriceError] = useState(""); // State báo lỗi giá

  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [productPriceMap, setProductPriceMap] = useState(new Map());

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      try {
        // ĐÃ THÊM &limit=1000 để ép Backend trả về toàn bộ sản phẩm
        const response = await apiClient.get(
          "/products?include_unavailable=true&limit=1000"
        );
        const products = response.data.data || [];
        setAllProducts(products);
        const priceMap = new Map();
        products.forEach((p) => priceMap.set(p.id, parseFloat(p.price)));
        setProductPriceMap(priceMap);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      const existingImg = initialData.image_url || initialData.image || "";
      setImageUrl(existingImg);
      setPreviewImage(existingImg);
      setIsAvailable(!!initialData.is_available);
      setDiscountAmount(initialData.discount_amount || "");
      setItems(
        initialData.items?.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.product_original_price),
        })) || [],
      );
    }
  }, [initialData]);

  // Logic tự động tính toán và Validate giá
  useEffect(() => {
    let newOriginalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    setOriginalPrice(newOriginalPrice);
  }, [items]);

  useEffect(() => {
    const discount = parseFloat(discountAmount) || 0;
    const newFinalPrice = originalPrice - discount;

    // Validate
    if (discount > originalPrice && originalPrice > 0) {
      setPriceError("Số tiền giảm giá không được lớn hơn tổng giá gốc!");
      setFinalPrice(0);
    } else {
      setPriceError("");
      setFinalPrice(newFinalPrice >= 0 ? newFinalPrice : 0);
    }
  }, [originalPrice, discountAmount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      const fileName = file.name.split(".")[0].replace(/\s+/g, "_");
      const timestamp = new Date().getTime();
      const generatedUrl = `https://res.cloudinary.com/dbninixn6/image/upload/v1776565794/fast_food_tasty/${fileName}_${timestamp}.webp`;
      setImageUrl(generatedUrl);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const productPrice = productPriceMap.get(selectedProduct.id);
    const existingItem = items.find((i) => i.product_id === selectedProduct.id);

    if (existingItem) {
      setItems(
        items.map((i) =>
          i.product_id === selectedProduct.id
            ? { ...i, quantity: i.quantity + selectedQuantity }
            : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          quantity: selectedQuantity,
          price: productPrice,
        },
      ]);
    }
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  // 7. Hàm Submit form (BẢN FIX TRIỆT ĐỂ LỖI UNDEFINED)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu nhanh trước khi gửi
    if (!name || name.trim() === "") {
      alert("Vui lòng nhập tên combo.");
      return;
    }
    if (items.length === 0) {
      alert("Combo phải có ít nhất một sản phẩm.");
      return;
    }

    // TẠO FORMDATA
    const formData = new FormData();

    // LẤY GIÁ TRỊ TỪ STATE (Dòng 16 - 27 trong file của bạn)
    // Phải dùng đúng tên biến: name, description, isAvailable, discountAmount
    formData.append("name", name);
    formData.append("description", description || "");
    formData.append("is_available", String(isAvailable)); // Chuyển về 'true'/'false'

    // Lưu ý: State của bạn tên là discountAmount (dòng 23)
    formData.append("discount_amount_from_form", Number(discountAmount) || 0);

    // XỬ LÝ ẢNH
    // Nếu có file mới chọn từ máy (selectedFile - dòng 20)
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    // Gửi kèm imageUrl (dòng 19) để backend lấy link nếu không upload file mới
    if (imageUrl) {
      formData.append("image_url", imageUrl);
    }

    // XỬ LÝ DANH SÁCH SẢN PHẨM (Biến Array thành String JSON)
    const itemsData = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    // Tuyệt đối không để items bị undefined
    formData.append("items", JSON.stringify(itemsData));

    // --- KIỂM TRA TRƯỚC KHI GỬI (F12 Console sẽ hiện cái này) ---
    console.log("--- DỮ LIỆU GỬI ĐI ---");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Gọi hàm onSubmit truyền ra ngoài cho Page
    onSubmit(formData);
  };
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "800", color: "#111827", mb: 3 }}
        >
          Thông Tin Cơ Bản
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Tên Combo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: "bold", color: "#4B5563" }}
            >
              Hình ảnh Combo
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mb: 2 }}
            >
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadOutlinedIcon />}
                disabled={loading}
                sx={{ textTransform: "none", py: 1 }}
              >
                Tải ảnh từ máy
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              <TextField
                label="Hoặc dán Link ảnh (URL)"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewImage(e.target.value);
                  if (e.target.value === "") setSelectedFile(null);
                }}
                fullWidth
                size="small"
                disabled={loading}
              />
            </Stack>

            {previewImage && (
              <Box
                sx={{
                  mt: 2,
                  p: 1,
                  border: "1px dashed #ccc",
                  borderRadius: 2,
                  width: "fit-content",
                }}
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ maxHeight: 120, borderRadius: 4 }}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Mô tả chi tiết"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography fontWeight="500">
                  Đang bán (Hiển thị trên web)
                </Typography>
              }
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }}>
          <Chip label="Cấu Hình Sản Phẩm" color="primary" variant="outlined" />
        </Divider>

        {/* Khu vực thêm sản phẩm */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Autocomplete
              fullWidth
              options={allProducts}
              value={selectedProduct}
              onChange={(_, val) => setSelectedProduct(val)}
              getOptionLabel={(opt) =>
                `${opt.name} - ${parseInt(opt.price).toLocaleString()}đ`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tìm chọn sản phẩm..."
                  sx={{ bgcolor: "white" }}
                />
              )}
            />
            <TextField
              type="number"
              label="Số lượng"
              value={selectedQuantity}
              onChange={(e) =>
                setSelectedQuantity(parseInt(e.target.value) || 1)
              }
              sx={{ width: { xs: "100%", sm: 120 }, bgcolor: "white" }}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <Button
              variant="contained"
              onClick={handleAddItem}
              startIcon={<AddShoppingCartIcon />}
              sx={{ minWidth: 120, boxShadow: 0 }}
            >
              Thêm
            </Button>
          </Stack>
        </Paper>

        {/* Danh sách đã chọn */}
        <List sx={{ mb: 2 }}>
          {items.length === 0 ? (
            <Typography
              align="center"
              color="text.secondary"
              sx={{ py: 3, fontStyle: "italic" }}
            >
              Chưa có sản phẩm nào trong combo.
            </Typography>
          ) : (
            items.map((item) => (
              <ListItem
                key={item.product_id}
                sx={{
                  bgcolor: "white",
                  border: "1px solid #eee",
                  borderRadius: 2,
                  mb: 1,
                }}
              >
                <FastfoodIcon sx={{ mr: 2, color: "text.secondary" }} />
                <ListItemText
                  primary={
                    <Typography fontWeight="bold">{item.name}</Typography>
                  }
                  secondary={`${parseInt(item.price).toLocaleString()}đ x ${item.quantity}`}
                />
                <Typography
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mr: 3 }}
                >
                  {(item.price * item.quantity).toLocaleString()}đ
                </Typography>
                <IconButton
                  color="error"
                  onClick={() =>
                    setItems(
                      items.filter((i) => i.product_id !== item.product_id),
                    )
                  }
                  size="small"
                  sx={{ bgcolor: "#FEE2E2" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </ListItem>
            ))
          )}
        </List>

        <Divider sx={{ my: 4 }}>
          <Chip label="Định Giá Combo" color="success" variant="outlined" />
        </Divider>

        {/* Bảng giá */}
        <Grid
          container
          spacing={3}
          sx={{
            p: 3,
            bgcolor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 2,
            alignItems: "center",
          }}
        >
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Tổng giá gốc các món
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {originalPrice.toLocaleString()} VNĐ
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Số tiền giảm (Trừ trực tiếp)"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              type="number"
              fullWidth
              error={!!priceError}
              sx={{ bgcolor: "white" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{ textAlign: { xs: "left", sm: "right" } }}
          >
            <Typography variant="body2" color="text.secondary">
              Khách hàng sẽ thanh toán
            </Typography>
            <Typography variant="h4" fontWeight="900" color="success.main">
              {finalPrice.toLocaleString()} đ
            </Typography>
          </Grid>
          {priceError && (
            <Grid item xs={12}>
              <Alert severity="error">{priceError}</Alert>
            </Grid>
          )}
        </Grid>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 5,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: 8,
            textTransform: "none",
          }}
          disabled={loading || items.length === 0 || !!priceError}
        >
          {loading ? (
            <CircularProgress size={28} color="inherit" />
          ) : initialData ? (
            "Cập Nhật Combo"
          ) : (
            "Tạo Combo Mới"
          )}
        </Button>
      </Box>
    </Paper>
  );
}

export default ComboForm;
