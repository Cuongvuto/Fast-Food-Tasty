// src/pages/homeSections/SuggestionsSection.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../API/axiosConfig';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import ProductCard from '../../components/ProductCard';

// === COMPONENT BỌC NGOÀI ĐỂ THÊM NHÃN GIẢM GIÁ ===
function SuggestionCardWrapper({ product, index }) {
    // Giả lập phần trăm giảm giá để giống ảnh (30%, 10%, 15%...)
    const discounts = [30, 10, 15, 10, 15]; 
    const discount = discounts[index] || 10;

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {/* Nhãn giảm giá màu ĐỎ */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 15, 
                    left: 15,
                    zIndex: 10,
                    bgcolor: '#FF0000', 
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {discount}%
            </Box>

            {/* Thẻ sản phẩm gốc */}
            <ProductCard product={product} />
        </Box>
    );
}

function SuggestionsSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Bạn có thể tăng số lượng lên 8 hoặc 10 để vuốt cho đã
                const response = await apiClient.get('/products?limit=5'); 
                setProducts(response.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}><CircularProgress color="error" /></Box>;

    return (
        <Container maxWidth="lg" sx={{ my: 8 }}>
            {/* 1. HEADER */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                        fontWeight: 800,
                        color: '#000',
                        mb: 1,
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                    }}
                >
                    Gợi ý của chúng tôi
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', fontSize: '1rem' }} />
            </Box>
            
            {/* 2. SLIDER LAYOUT: Đổi từ Grid sang Box trượt ngang */}
            <Box 
                sx={{ 
                    display: 'flex',
                    overflowX: 'auto', // Bật cuộn ngang
                    gap: 3, // Khoảng cách giữa các thẻ sản phẩm
                    pb: 3, // Đệm dưới để không bị cắt bóng đổ của thẻ (box-shadow)
                    pt: 1, // Đệm trên một chút
                    px: 1, // Đệm hai bên để thẻ đầu/cuối không sát viền màn hình
                    
                    // Cấu hình trượt mượt mà
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory', // Giúp thẻ tự động "khớp" vào vị trí khi vuốt
                    
                    // Ẩn thanh cuộn mặc định cho đẹp
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {products.map((product, index) => (
                    <Box 
                        key={product.id}
                        sx={{
                            // Cố định chiều rộng của thẻ. Đổi số này nếu muốn thẻ to/nhỏ hơn
                            minWidth: { xs: '260px', sm: '280px', md: '300px' }, 
                            flexShrink: 0, // NGĂN CHẶN thẻ bị bóp méo khi màn hình nhỏ
                            scrollSnapAlign: 'start', // Điểm neo khi vuốt trượt
                        }}
                    >
                        <SuggestionCardWrapper product={product} index={index} />
                    </Box>
                ))}
            </Box>

            {/* 3. FOOTER */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography 
                    component="a" 
                    href="/menu" 
                    sx={{ 
                        color: '#FF6B00',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        '&:hover': { color: '#e65100' }
                    }}
                >
                    See all
                </Typography>
            </Box>
        </Container>
    );
}

export default SuggestionsSection;