// src/pages/AdminEditComboPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ComboForm from '../components/admin/ComboForm'; // Import form chung
import apiClient from'../API/axiosConfig';

function AdminEditComboPage() {
    const { comboId } = useParams(); // Lấy ID combo từ URL
    const navigate = useNavigate();
    
    // State để lưu dữ liệu combo tải về
    const [initialData, setInitialData] = useState(null); 
    // State loading chung (cho cả fetch và update)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 1. Fetch dữ liệu combo cần sửa khi component mount
    useEffect(() => {
        const fetchCombo = async () => {
            setLoading(true);
            setError('');
            try {
                // Gọi API lấy chi tiết combo (bao gồm cả 'items')
                const response = await apiClient.get(`/combos/${comboId}`);
                setInitialData(response.data.data); // API trả về { data: { id: ..., name: ..., items: [...] } }
            } catch (err) {
                setError('Không thể tải thông tin combo.');
                console.error("Lỗi tải combo để sửa:", err);
            } finally {
                setLoading(false); // Dừng loading sau khi fetch xong
            }
        };
        fetchCombo();
    }, [comboId]); // Chạy lại nếu comboId thay đổi

    // 2. Hàm xử lý khi submit form sửa
    const handleEditCombo = async (comboData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            console.log("Dữ liệu gửi đi (Cập nhật Combo):", comboData);
            // Gọi API PUT để cập nhật
            await apiClient.put(`/combos/${comboId}`, comboData);
            
            setSuccess('Cập nhật combo thành công!');
            setTimeout(() => {
                navigate('/admin/combos'); // Chuyển về trang danh sách
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật combo thất bại.');
            console.error("Lỗi cập nhật combo:", err);
            setLoading(false);
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/admin/combos')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Sửa Combo (ID: {comboId})
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Hiển thị loading khi đang fetch dữ liệu ban đầu */}
            {loading && !initialData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress size={60} />
                </Box>
            )}

            {/* Chỉ render form khi đã có initialData và không còn loading */}
            {!loading && initialData && (
                <ComboForm
                    initialData={initialData} // Truyền dữ liệu ban đầu vào form
                    onSubmit={handleEditCombo}
                    loading={loading && !!initialData} // Loading cho nút submit (khi đang gửi update)
                />
            )}
            
            {/* Hiển thị thông báo nếu không tải được dữ liệu ban đầu */}
             {!loading && !initialData && error && (
                 <Alert severity="warning">Không có dữ liệu combo để hiển thị.</Alert>
             )}
        </Container>
    );
}

export default AdminEditComboPage;