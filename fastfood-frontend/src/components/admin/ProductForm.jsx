// src/components/admin/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography, CircularProgress, Alert,
    Select, MenuItem, FormControl, InputLabel, Paper, Grid,
    FormControlLabel, Checkbox // <-- ĐÃ THÊM IMPORT
} from '@mui/material';
import apiClient from '../../API/axiosConfig'; // Import apiClient

function ProductForm({ initialData = null, onSubmit, loading }) {
    // State cho form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true); // Mặc định là có sẵn
    const [isHot, setIsHot] = useState(false); // Mặc định là không hot

    // State cho danh sách categories
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState('');

    // Load categories từ API khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setErrorCategories(''); // Reset lỗi
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data.data || []);
            } catch (err) {
                setErrorCategories('Không thể tải danh mục.');
                console.error("Lỗi tải categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Điền dữ liệu vào form nếu là chế độ sửa (có initialData)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setPrice(initialData.price || '');
            setCategoryId(initialData.category_id || '');
            setImageUrl(initialData.image_url || '');
            // Xử lý cả giá trị boolean và number (0/1) từ API
            setIsAvailable(!!initialData.is_available); // Convert sang boolean
            setIsHot(!!initialData.is_hot); // Convert sang boolean
        } else {
             // Reset form khi không có initialData (chế độ thêm mới)
             setName('');
             setDescription('');
             setPrice('');
             setCategoryId('');
             setImageUrl('');
             setIsAvailable(true);
             setIsHot(false);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra categoryId có hợp lệ không
        if (!categoryId) {
            alert('Vui lòng chọn Loại Sản Phẩm.');
            return;
        }
        const productData = {
            name,
            description,
            price: Number(price) || 0, // Đảm bảo giá là số
            category_id: categoryId,
            image_url: imageUrl,
            is_available: isAvailable, // Gửi giá trị boolean
            is_hot: isHot // Gửi giá trị boolean
        };
        onSubmit(productData); // Gọi hàm onSubmit được truyền từ component cha
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {initialData ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </Typography>

                {errorCategories && <Alert severity="error" sx={{ mb: 2 }}>{errorCategories}</Alert>}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tên Sản Phẩm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <TextField
                            label="Giá (VNĐ)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            fullWidth
                            required
                            type="number" // Đảm bảo nhập số
                            inputProps={{ min: 0 }} // Giá không âm
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required disabled={loading || loadingCategories}>
                            <InputLabel id="category-select-label">Loại Sản Phẩm</InputLabel>
                            <Select
                                labelId="category-select-label"
                                id="category-select"
                                value={categoryId}
                                label="Loại Sản Phẩm"
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {loadingCategories ? (
                                    <MenuItem disabled value=""><em>Đang tải danh mục...</em></MenuItem>
                                ) : categories.length === 0 ? (
                                    <MenuItem disabled value=""><em>Không có danh mục</em></MenuItem>
                                ) : (
                                    categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="URL Hình Ảnh"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            fullWidth
                            required
                            disabled={loading}
                            helperText="Dán đường dẫn URL của hình ảnh vào đây"
                        />
                         {/* Xem trước ảnh */}
                         {imageUrl && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img
                                    src={imageUrl}
                                    alt="Xem trước"
                                    style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                                    onError={(e) => { e.target.style.display = 'none'; /* Ẩn nếu ảnh lỗi */ }}
                                    onLoad={(e) => { e.target.style.display = 'inline-block'; /* Hiện nếu ảnh load được */ }}
                                />
                            </Box>
                         )}
                    </Grid>
                    <Grid item xs={12}>
                         <TextField
                            label="Mô tả / Ghi chú"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            disabled={loading}
                        />
                    </Grid>
                    {/* Checkbox cho is_available và is_hot */}
                     <Grid item xs={6}>
                        <FormControlLabel
                            control={<Checkbox checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />}
                            label="Có sẵn để bán"
                            disabled={loading}
                        />
                    </Grid>
                     <Grid item xs={6}>
                        <FormControlLabel
                            control={<Checkbox checked={isHot} onChange={(e) => setIsHot(e.target.checked)} />}
                            label="Sản phẩm Hot"
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || loadingCategories} // Disable nếu đang loading form hoặc categories
                            fullWidth
                            sx={{ py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : (initialData ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm')}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
}

export default ProductForm;