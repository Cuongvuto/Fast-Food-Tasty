// src/pages/AdminAddProductPage.jsx
import React, { useState } from 'react';
import { Container, Typography, Box, Alert, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/admin/ProductForm';
import apiClient from '../API/axiosConfig';

function AdminAddProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddProduct = async (productData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // **QUAN TRỌNG: Gọi API backend để tạo sản phẩm mới**
            // Ví dụ: const response = await apiClient.post('/products', productData);
            console.log("Dữ liệu gửi đi:", productData);
            
             await apiClient.post('/products', productData);
            setSuccess('Thêm sản phẩm thành công!');
            // Chuyển hướng về trang danh sách sau khi thêm thành công (sau 1.5s)
            setTimeout(() => {
                navigate('/admin'); // Hoặc /admin/products nếu route khác
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Thêm sản phẩm thất bại.');
            console.error("Lỗi thêm sản phẩm:", err);
            setLoading(false);
        }
        // setLoading(false) sẽ dừng khi có lỗi hoặc sau khi navigate
    };

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Thêm Sản Phẩm Mới
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Truyền hàm xử lý submit và trạng thái loading vào form */}
            <ProductForm onSubmit={handleAddProduct} loading={loading} />
        </Container>
    );
}

export default AdminAddProductPage;