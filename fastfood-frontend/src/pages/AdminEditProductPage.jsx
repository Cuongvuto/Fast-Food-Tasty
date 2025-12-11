// src/pages/AdminEditProductPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/admin/ProductForm';
import apiClient from'../API/axiosConfig';

function AdminEditProductPage() {
    const { productId } = useParams(); // Lấy ID sản phẩm từ URL
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null); // Dữ liệu sản phẩm ban đầu
    const [loading, setLoading] = useState(true); // Loading cho cả fetch và update
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch dữ liệu sản phẩm cần sửa khi component mount hoặc productId thay đổi
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            try {
                // **QUAN TRỌNG: Gọi API backend lấy chi tiết sản phẩm theo ID**
                const response = await apiClient.get(`/products/${productId}`);
                setInitialData(response.data.data);
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm.');
                console.error("Lỗi tải sản phẩm để sửa:", err);
            } finally {
                setLoading(false); // Dừng loading sau khi fetch xong (kể cả lỗi)
            }
        };
        fetchProduct();
    }, [productId]);

    const handleEditProduct = async (productData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // **QUAN TRỌNG: Gọi API backend để cập nhật sản phẩm**
            // Ví dụ: const response = await apiClient.put(`/products/${productId}`, productData);
            console.log("Dữ liệu cập nhật:", productData);
            
            await apiClient.put(`/products/${productId}`, productData);
            setSuccess('Cập nhật sản phẩm thành công!');
            // Chuyển hướng về trang danh sách sau khi sửa thành công (sau 1.5s)
            setTimeout(() => {
                navigate('/admin'); // Hoặc /admin/products
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật sản phẩm thất bại.');
            console.error("Lỗi cập nhật sản phẩm:", err);
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
                    Sửa Sản Phẩm (ID: {productId})
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Hiển thị loading khi đang fetch dữ liệu ban đầu */}
            {loading && !initialData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Chỉ render form khi có initialData và không có lỗi fetch ban đầu */}
            {!loading && initialData && !error && (
                <ProductForm
                    initialData={initialData} // Truyền dữ liệu ban đầu vào form
                    onSubmit={handleEditProduct}
                    loading={loading} // Trạng thái loading cho nút submit
                />
            )}
             {/* Hiển thị thông báo nếu không tải được dữ liệu ban đầu */}
             {!loading && !initialData && error && (
                 <Alert severity="warning">Không có dữ liệu sản phẩm để hiển thị.</Alert>
             )}
        </Container>
    );
}

export default AdminEditProductPage;