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
    <Container maxWidth="lg" sx={{ py: 6 }}> {/* Chỉnh my: 8 thành py: 6 để giống phần Combo */}
        {/* 1. HEADER */}
        <Box sx={{ textAlign: 'center', mb: 4 }}> {/* Chỉnh mb: 6 thành mb: 4 */}
            <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                    fontWeight: 'bold', // Dùng 'bold' thay vì 800 để giống phần Combo
                    color: 'text.primary', // Dùng màu mặc định của hệ thống
                    mb: 1
                }}
            >
                Gợi ý của chúng tôi
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Sẽ ngon hơn khi thưởng thức cùng...
            </Typography>
        </Box>
        
        {/* 2. SLIDER LAYOUT */}
        <Box 
            sx={{ 
                display: 'flex',
                overflowX: 'auto',
                gap: 4, // Tăng gap lên 4 để khớp với spacing={4} của Grid Combo
                pb: 3, 
                pt: 1, 
                px: 1, 
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}
        >
            {products.map((product, index) => (
                <Box 
                    key={product.id}
                    sx={{
                        minWidth: { xs: '260px', sm: '280px', md: '300px' }, 
                        flexShrink: 0,
                        scrollSnapAlign: 'start',
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
                    color: 'primary.main', // Sử dụng màu chính của Theme thay vì mã màu cứng
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    '&:hover': { textDecoration: 'underline' } // Thêm gạch chân khi hover cho giống link chuẩn
                }}
            >
                See all
            </Typography>
        </Box>
    </Container>
);
}

export default SuggestionsSection;