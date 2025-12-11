// src/components/admin/ComboForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography, CircularProgress, Alert,
    Select, MenuItem, FormControl, InputLabel, Paper, Grid,
    FormControlLabel, Checkbox, IconButton, Autocomplete, List,
    ListItem, ListItemText, ListItemSecondaryAction, Divider, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import apiClient from '../../API/axiosConfig';

function ComboForm({ initialData = null, onSubmit, loading }) {
    // State thông tin cơ bản
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);

    // --- THAY ĐỔI VỀ GIÁ ---
    // 'price' giờ là 'discountAmount'
    const [discountAmount, setDiscountAmount] = useState('');
    // State mới để hiển thị giá
    const [originalPrice, setOriginalPrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);

    // State cho sản phẩm con
    const [items, setItems] = useState([]); // [{ product_id, name, quantity, price }]
    const [allProducts, setAllProducts] = useState([]); // [{ id, name, price, ... }]
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
                const response = await apiClient.get('/products?include_unavailable=true');
                const products = response.data.data || [];
                setAllProducts(products);

                // Tạo map tra cứu giá
                const priceMap = new Map();
                products.forEach(p => priceMap.set(p.id, parseFloat(p.price)));
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
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setImageUrl(initialData.image_url || '');
            setIsAvailable(!!initialData.is_available);
            
            // Lấy giá trị từ CSDL
            setDiscountAmount(initialData.discount_amount || ''); // << SỬA
            
            // API (getComboById) mới của chúng ta đã trả về 'product_original_price'
            setItems(initialData.items.map(item => ({
                product_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.product_original_price) // Lưu giá gốc của sản phẩm con
            })) || []);
        }
    }, [initialData]);

    // 3. Tự động tính toán lại Giá Gốc (Original Price) khi 'items' thay đổi
    useEffect(() => {
        let newOriginalPrice = 0;
        for (const item of items) {
            // Lấy giá đã lưu trong 'items' (lúc thêm vào)
            if (item.price && item.quantity) { 
                newOriginalPrice += item.price * item.quantity;
            }
        }
        setOriginalPrice(newOriginalPrice);
    }, [items]);

    // 4. Tự động tính toán lại Giá Cuối Cùng (Final Price) khi Giá Gốc hoặc Giảm Giá thay đổi
    useEffect(() => {
        const discount = parseFloat(discountAmount) || 0;
        const newFinalPrice = originalPrice - discount;
        setFinalPrice(newFinalPrice >= 0 ? newFinalPrice : 0); // Đảm bảo giá không âm
    }, [originalPrice, discountAmount]);

    // 5. Hàm thêm sản phẩm vào combo
    const handleAddItem = () => {
        if (!selectedProduct || !productPriceMap.has(selectedProduct.id)) {
            alert('Vui lòng chọn một sản phẩm hợp lệ.');
            return;
        }
        // ... (kiểm tra quantity > 0) ...

        const existingItem = items.find(item => item.product_id === selectedProduct.id);
        const productPrice = productPriceMap.get(selectedProduct.id);

        if (existingItem) {
            setItems(items.map(item =>
                item.product_id === selectedProduct.id
                    ? { ...item, quantity: item.quantity + selectedQuantity }
                    : item
            ));
        } else {
            setItems([
                ...items,
                {
                    product_id: selectedProduct.id,
                    name: selectedProduct.name,
                    quantity: selectedQuantity,
                    price: productPrice // Lưu giá gốc của sản phẩm tại thời điểm thêm
                }
            ]);
        }
        setSelectedProduct(null);
        setSelectedQuantity(1);
    };

    // 6. Hàm xóa sản phẩm
    const handleRemoveItem = (productId) => {
        setItems(items.filter(item => item.product_id !== productId));
    };

    // 7. Hàm Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Combo phải có ít nhất một sản phẩm.');
            return;
        }

        const comboData = {
            name,
            description,
            // Gửi 'discount_amount_from_form' thay vì 'price'
            discount_amount_from_form: Number(discountAmount) || 0,
            image_url: imageUrl,
            is_available: isAvailable,
            // 'items' chỉ cần gửi mảng { product_id, quantity }
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }))
        };
        onSubmit(comboData);
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {initialData ? 'Sửa Combo' : 'Tạo Combo Mới'}
                </Typography>
                
                {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField label="Tên Combo" value={name} onChange={(e) => setName(e.target.value)} fullWidth required disabled={loading}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="URL Hình Ảnh Combo" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} fullWidth required disabled={loading}/>
                    </Grid>
                    <Grid item xs={12}>
                         <TextField label="Mô tả Combo" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} disabled={loading}/>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel control={<Checkbox checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />} label="Có sẵn để bán" disabled={loading}/>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}><Chip label="Định Giá Combo" /></Divider>
                
                {/* PHẦN 1.5: ĐỊNH GIÁ */}
                <Grid container spacing={2} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={4}>
                        <Typography color="text.secondary">Giá gốc (Tự động tính):</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {originalPrice.toLocaleString('vi-VN')}đ
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
                        <Typography color="text.secondary">Giá cuối cùng (Hiển thị):</Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                            {finalPrice.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}><Chip label="Sản Phẩm Trong Combo" /></Divider>

                {/* PHẦN 2: THÊM SẢN PHẨM VÀO COMBO */}
                <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                value={selectedProduct}
                                onChange={(event, newValue) => setSelectedProduct(newValue)}
                                options={allProducts}
                                getOptionLabel={(option) => `${option.name} (${parseInt(option.price).toLocaleString('vi-VN')}đ)`} // Hiển thị tên + giá
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => <TextField {...params} label="Chọn sản phẩm" variant="outlined" />}
                                loading={loadingProducts}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                label="Số lượng"
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                                fullWidth
                                inputProps={{ min: 1 }}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleAddItem} fullWidth sx={{ height: '56px' }} disabled={loading || loadingProducts || !selectedProduct}>
                                Thêm
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* PHẦN 3: DANH SÁCH SẢN PHẨM ĐÃ THÊM */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>Danh sách sản phẩm ({items.length})</Typography>
                <List dense>
                    {items.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>Chưa có sản phẩm nào trong combo.</Typography>
                    ) : (
                        items.map((item) => (
                            <ListItem key={item.product_id} divider>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`Giá gốc: ${parseInt(item.price).toLocaleString('vi-VN')}đ`}
                                />
                                <Chip label={`Số lượng: ${item.quantity}`} sx={{ mr: 2 }} />
                                <Typography sx={{ mr: 2, fontWeight: 500 }}>
                                    Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </Typography>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.product_id)} color="error" disabled={loading}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    )}
                </List>
                
                {/* NÚT SUBMIT */}
                <Button type="submit" variant="contained" disabled={loading || loadingProducts} fullWidth sx={{ py: 1.5, mt: 3, fontSize: '1rem' }}>
                    {loading ? <CircularProgress size={24} color="inherit"/> : (initialData ? 'Lưu Thay Đổi Combo' : 'Tạo Combo Mới')}
                </Button>
            </Box>
        </Paper>
    );
}

export default ComboForm;