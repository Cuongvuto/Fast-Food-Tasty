// src/components/admin/ComboForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  IconButton,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import apiClient from "../../API/axiosConfig";

function ComboForm({ initialData = null, onSubmit, loading }) {
  // State thông tin cơ bản
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // --- CÁC STATE MỚI CHO UPLOAD ẢNH (Bê nguyên từ ProductForm) ---
  const [selectedFile, setSelectedFile] = useState(null); // File thực tế
  const [previewUrl, setPreviewUrl] = useState(""); // Link xem trước (blob hoặc link cũ)
  const [enteredUrl, setEnteredUrl] = useState(""); // Link nhập tay (nếu không muốn up ảnh)

  // --- THAY ĐỔI VỀ GIÁ ---
  const [discountAmount, setDiscountAmount] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // State cho sản phẩm con
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // State cho ô chọn
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Map để tra cứu giá sản phẩm nhanh
  const [productPriceMap, setProductPriceMap] = useState(new Map());

  // 1. Tải danh sách tất cả sản phẩm
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await apiClient.get(
          "/products?include_unavailable=true",
        );
        const products = response.data.data || [];
        setAllProducts(products);

        const priceMap = new Map();
        products.forEach((p) => priceMap.set(p.id, parseFloat(p.price)));
        setProductPriceMap(priceMap);
      } catch (err) {
        console.error("Lỗi tải danh sách sản phẩm:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAllProducts();
  }, []);

  // 2. Điền dữ liệu nếu là form Sửa
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setIsAvailable(!!initialData.is_available);
      setDiscountAmount(initialData.discount_amount || "");

      // --- LOGIC ẢNH CHUẨN TỪ PRODUCT FORM ---
      const existingImage = initialData.image_url || initialData.image || "";
      setPreviewUrl(existingImage);
      setEnteredUrl(existingImage);

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

  // 3. Tự động tính toán lại Giá Gốc
  useEffect(() => {
    let newOriginalPrice = 0;
    for (const item of items) {
      if (item.price && item.quantity) {
        newOriginalPrice += item.price * item.quantity;
      }
    }
    setOriginalPrice(newOriginalPrice);
  }, [items]);

  // 4. Tự động tính toán lại Giá Cuối Cùng
  useEffect(() => {
    const discount = parseFloat(discountAmount) || 0;
    const newFinalPrice = originalPrice - discount;
    setFinalPrice(newFinalPrice >= 0 ? newFinalPrice : 0);
  }, [originalPrice, discountAmount]);

 // --- XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE TỪ MÁY ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Lưu file thật để gửi lên server
      setSelectedFile(file);

      // 2. Tạo link xem trước (blob) để hiện ảnh lên khung preview ngay lập tức
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 3. TỰ ĐỘNG SINH URL CLOUDINARY (Giống logic bạn yêu cầu)
      const fileName = file.name.split(".")[0]; // Lấy tên file gốc (ví dụ: burger-ngon)
      const timestamp = new Date().getTime(); // Dùng timestamp thay cho random để tránh trùng lặp tuyệt đối
      
      // Chuỗi URL theo định dạng bạn cung cấp
      const customUrl = `https://res.cloudinary.com/dbninixn6/image/upload/v1776565794/fast_food_tasty/${fileName}_${timestamp}.webp`;

      // CẬP NHẬT THẲNG VÀO STATE ĐỂ TextField HIỂN THỊ
      setEnteredUrl(customUrl);
      
      console.log("Đã tự điền URL mới:", customUrl); // Bạn có thể check f12 để xem link đã tạo chưa
    }
  };

  // 5. Hàm thêm sản phẩm vào combo
  const handleAddItem = () => {
    if (!selectedProduct || !productPriceMap.has(selectedProduct.id)) {
      alert("Vui lòng chọn một sản phẩm hợp lệ.");
      return;
    }

    const existingItem = items.find(
      (item) => item.product_id === selectedProduct.id,
    );
    const productPrice = productPriceMap.get(selectedProduct.id);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === selectedProduct.id
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item,
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

  // 6. Hàm xóa sản phẩm
  const handleRemoveItem = (productId) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  // 7. Hàm Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Combo phải có ít nhất một sản phẩm.");
      return;
    }

    const comboData = {
      name,
      description,
      discount_amount_from_form: Number(discountAmount) || 0,
      is_available: isAvailable,

      // Logic gửi link/file như ProductForm
      image_url: enteredUrl,
      image: selectedFile,

      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };
    onSubmit(comboData);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          {initialData ? "Sửa Combo" : "Tạo Combo Mới"}
        </Typography>

        {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Tên Combo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          {/* --- KHU VỰC UPLOAD ẢNH (BÊ NGUYÊN TỪ PRODUCT FORM) --- */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh Combo
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f9f9f9" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                {/* Nút Upload */}
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                >
                  Tải ảnh lên
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>

                <Typography variant="body2" color="text.secondary">
                  {selectedFile ? selectedFile.name : "Hoặc nhập link bên dưới"}
                </Typography>
              </Stack>

              {/* Ô nhập link dự phòng (cho ảnh mạng hoặc ảnh cũ) */}
              <TextField
                label="Hoặc dán URL ảnh online"
                value={enteredUrl}
                onChange={(e) => {
                  setEnteredUrl(e.target.value);
                  setPreviewUrl(e.target.value); // Xem trước luôn link nhập
                  setSelectedFile(null); // Nếu nhập link thì bỏ file chọn
                }}
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                disabled={loading}
              />

              {/* Khung xem trước ảnh */}
              {previewUrl && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Xem trước:
                  </Typography>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxHeight: 200,
                      maxWidth: "100%",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          {/* ------------------------------------------- */}

          <Grid item xs={12}>
            <TextField
              label="Mô tả Combo"
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
                />
              }
              label="Có sẵn để bán"
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }}>
          <Chip label="Định Giá Combo" />
        </Divider>

        {/* PHẦN 1.5: ĐỊNH GIÁ */}
        <Grid
          container
          spacing={2}
          sx={{
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            alignItems: "center",
          }}
        >
          <Grid item xs={12} sm={4}>
            <Typography color="text.secondary">
              Giá gốc (Tự động tính):
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {originalPrice.toLocaleString("vi-VN")}đ
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Số tiền giảm giá (VNĐ)"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              fullWidth
              required
              type="number"
              disabled={loading}
              helperText="Nhập 20000 để giảm 20.000đ"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography color="text.secondary">
              Giá cuối cùng (Hiển thị):
            </Typography>
            <Typography
              variant="h5"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              {finalPrice.toLocaleString("vi-VN")}đ
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }}>
          <Chip label="Sản Phẩm Trong Combo" />
        </Divider>

        {/* PHẦN 2: THÊM SẢN PHẨM VÀO COMBO */}
        <Box sx={{ p: 2, border: "1px dashed grey", borderRadius: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                options={allProducts}
                getOptionLabel={(option) =>
                  `${option.name} (${parseInt(option.price).toLocaleString("vi-VN")}đ)`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn sản phẩm"
                    variant="outlined"
                  />
                )}
                loading={loadingProducts}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Số lượng"
                type="number"
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(parseInt(e.target.value) || 1)
                }
                fullWidth
                inputProps={{ min: 1 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={handleAddItem}
                fullWidth
                sx={{ height: "56px" }}
                disabled={loading || loadingProducts || !selectedProduct}
              >
                Thêm
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* PHẦN 3: DANH SÁCH SẢN PHẨM ĐÃ THÊM */}
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 500, mt: 2 }}
        >
          Danh sách sản phẩm ({items.length})
        </Typography>
        <List dense>
          {items.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              Chưa có sản phẩm nào trong combo.
            </Typography>
          ) : (
            items.map((item) => (
              <ListItem key={item.product_id} divider>
                <ListItemText
                  primary={item.name}
                  secondary={`Giá gốc: ${parseInt(item.price).toLocaleString("vi-VN")}đ`}
                />
                <Chip label={`Số lượng: ${item.quantity}`} sx={{ mr: 2 }} />
                <Typography sx={{ mr: 2, fontWeight: 500 }}>
                  Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </Typography>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveItem(item.product_id)}
                    color="error"
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>

        {/* NÚT SUBMIT */}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || loadingProducts}
          fullWidth
          sx={{ py: 1.5, mt: 3, fontSize: "1rem" }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : initialData ? (
            "Lưu Thay Đổi Combo"
          ) : (
            "Tạo Combo Mới"
          )}
        </Button>
      </Box>
    </Paper>
  );
}

export default ComboForm;
