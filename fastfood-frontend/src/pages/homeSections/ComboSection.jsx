// src/pages/homeSections/ComboSection.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Alert, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../API/axiosConfig';
import ComboCard from '../../components/ComboCard'; // Import card mới
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // Icon cho combo

function ComboSection() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCombos = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi API lấy combo cho khách hàng
                const response = await apiClient.get('/combos'); 
                // Chỉ lấy 3-4 combo hot nhất (ví dụ: slice(0, 4))
                // Hoặc bạn có thể tạo API /api/combos/hot
                setCombos(response.data.data.slice(0, 4)); // Tạm thời lấy 4 combo đầu tiên
            } catch (err) {
                setError('Không thể tải danh sách combo.');
                console.error("Lỗi tải combo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCombos();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (combos.length === 0) {
        return null; // Ẩn section nếu không có combo nào
    }

    return (
        <Container sx={{ py: 6 }}>
            {/* Tiêu đề Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <LocalOfferIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                    Combo Hot Tuần Này
                </Typography>
                <Typography color="text.secondary">
                    Tiết kiệm hơn với các gói combo đặc biệt!
                </Typography>
            </Box>

            {/* Danh sách Combo */}
            <Grid container spacing={4}>
                {combos.map((combo) => (
                    <Grid item key={combo.id} xs={12} sm={6} md={3}>
                        <ComboCard combo={combo} />
                    </Grid>
                ))}
            </Grid>

            {/* Nút Xem Thêm (Nếu muốn) */}
            {/* <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/menu?category=combos')} // Giả sử bạn có trang menu/combo
                >
                    Xem Tất Cả Combo
                </Button>
            </Box> */}
        </Container>
    );
}

export default ComboSection;