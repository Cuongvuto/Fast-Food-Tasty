// src/components/admin/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, Typography, CircularProgress, Alert,
    Select, MenuItem, FormControl, InputLabel, Paper, Grid,
    FormControlLabel, Checkbox, Stack // <-- Thêm Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // <-- Thêm Icon upload
import apiClient from '../../API/axiosConfig';

function ProductForm({ initialData = null, onSubmit, loading }) {
    // Các state cơ bản
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [isHot, setIsHot] = useState(false);

    // --- CÁC STATE MỚI CHO UPLOAD ẢNH ---
    const [selectedFile, setSelectedFile] = useState(null); // File thực tế
    const [previewUrl, setPreviewUrl] = useState('');       // Link xem trước (blob hoặc link cũ)
    const [enteredUrl, setEnteredUrl] = useState('');       // Link nhập tay (nếu không muốn up ảnh)

    // State danh mục
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState('');

    // Load danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data.data || []);
            } catch (err) {
                setErrorCategories('Không thể tải danh mục.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Load dữ liệu cũ (Nếu là Sửa)
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setPrice(initialData.price || '');
            setCategoryId(initialData.category_id || '');
            setIsAvailable(!!initialData.is_available);
            setIsHot(!!initialData.is_hot);
            
            // Nếu có ảnh cũ thì hiện vào preview và ô nhập URL
            setPreviewUrl(initialData.image_url || '');
            setEnteredUrl(initialData.image_url || '');
        }
    }, [initialData]);

    // --- XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE TỪ MÁY ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Tạo một link ảo để xem trước ảnh ngay lập tức
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- XỬ LÝ SUBMIT (QUAN TRỌNG NHẤT) ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!categoryId) {
            alert('Vui lòng chọn Loại Sản Phẩm.');
            return;
        }

        // 1. Tạo thùng hàng FormData (Thay vì JSON)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category_id', categoryId);
        formData.append('is_available', isAvailable ? 1 : 0);
        formData.append('is_hot', isHot ? 1 : 0);

        // 2. Logic gửi ảnh:
        if (selectedFile) {
            // Trường hợp A: Có file upload -> Gửi file (Key là 'image')
            formData.append('image', selectedFile); 
        } else {
            // Trường hợp B: Không có file -> Gửi link text (Key là 'image_url')
            // (Dùng cho trường hợp nhập link mạng hoặc giữ nguyên ảnh cũ khi sửa)
            formData.append('image_url', enteredUrl);
        }

        // 3. Gửi thùng hàng đi
        onSubmit(formData); 
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {initialData ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </Typography>

                {errorCategories && <Alert severity="error" sx={{ mb: 2 }}>{errorCategories}</Alert>}

                <Grid container spacing={3}>
                    {/* Tên sản phẩm */}
                    <Grid item xs={12}>
                        <TextField 
                            label="Tên Sản Phẩm" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            fullWidth required disabled={loading} 
                        />
                    </Grid>

                    {/* Giá tiền */}
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Giá (VNĐ)" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            fullWidth required type="number" 
                            disabled={loading} 
                        />
                    </Grid>

                    {/* Danh mục */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required disabled={loadingCategories}>
                            <InputLabel>Loại Sản Phẩm</InputLabel>
                            <Select 
                                value={categoryId} 
                                label="Loại Sản Phẩm" 
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* --- KHU VỰC UPLOAD ẢNH (THAY ĐỔI CHÍNH) --- */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>Hình ảnh sản phẩm</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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

                            {/* Ô nhập link dự phòng (cho ảnh mạng) */}
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
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" display="block" gutterBottom>Xem trước:</Typography>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        style={{ 
                                            maxHeight: 200, 
                                            maxWidth: '100%', 
                                            borderRadius: 8, 
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                                        }} 
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                    {/* ------------------------------------------- */}

                    {/* Mô tả */}
                    <Grid item xs={12}>
                        <TextField 
                            label="Mô tả / Ghi chú" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            fullWidth multiline rows={4} 
                            disabled={loading} 
                        />
                    </Grid>

                    {/* Checkbox */}
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

                    {/* Nút Submit */}
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth size="large" 
                            disabled={loading || loadingCategories}
                            sx={{ py: 1.5, fontWeight: 'bold' }}
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