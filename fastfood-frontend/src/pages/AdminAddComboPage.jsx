// src/pages/AdminAddComboPage.jsx
import React, { useState } from 'react';
import { Container, Typography, Box, Alert, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ComboForm from '../components/admin/ComboForm'; // Import form mới
import apiClient from '../API/axiosConfig';

function AdminAddComboPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddCombo = async (comboData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            console.log("Dữ liệu gửi đi (Tạo Combo):", comboData);
            // Gọi API POST /api/combos đã tạo ở backend
            await apiClient.post('/combos', comboData);
            
            setSuccess('Thêm combo thành công!');
            setTimeout(() => {
                navigate('/admin/combos'); // Chuyển về trang danh sách combo
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Thêm combo thất bại.');
            console.error("Lỗi thêm combo:", err);
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
                    Thêm Combo Mới
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <ComboForm onSubmit={handleAddCombo} loading={loading} />
        </Container>
    );
}

export default AdminAddComboPage;