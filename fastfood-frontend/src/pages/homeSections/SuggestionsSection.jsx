// src/pages/homeSections/SuggestionsSection.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../API/axiosConfig';
import { Container, Typography, Box, CircularProgress, Grid } from '@mui/material';
import ProductCard from '../../components/ProductCard';

// === COMPONENT BỌC NGOÀI ĐỂ THÊM NHÃN GIẢM GIÁ ===
function SuggestionCardWrapper({ product, index }) {
    // Giả lập phần trăm giảm giá để giống ảnh (30%, 10%, 15%...)
    const discounts = [30, 10, 15, 10, 15]; 
    const discount = discounts[index] || 10;

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {/* Nhãn giảm giá màu ĐỎ (Giống ảnh) */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 15, // Căn chỉnh vị trí đè lên ảnh
                    left: 15,
                    zIndex: 10,
                    bgcolor: '#FF0000', // Màu đỏ tươi
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
                // Lấy đúng 5 sản phẩm để xếp bố cục (3 trên - 2 dưới)
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
            {/* 1. HEADER: Giống ảnh mẫu */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                        fontWeight: 800, // Chữ đậm
                        color: '#000',   // Màu đen tuyền
                        mb: 1,
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' // Font hiện đại, không chân
                    }}
                >
                    Our Suggest
                </Typography>
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: '#666',
                        fontSize: '1rem'
                    }}
                >
                    Lorem ipsum dolor sit amet consectetur. Maecenas nunc.
                </Typography>
            </Box>
            
            {/* 2. GRID LAYOUT: Bố cục 3 trên - 2 dưới */}
            <Grid 
                container 
                spacing={4} // Khoảng cách giữa các thẻ
                justifyContent="center" // Căn giữa các phần tử (giúp hàng dưới 2 cái nằm giữa)
            >
                {products.map((product, index) => (
                    <Grid 
                        item 
                        key={product.id} 
                        xs={12}    // Mobile: 1 cột
                        sm={6}     // Tablet: 2 cột
                        md={4}     // Desktop: 3 cột
                    >
                        <SuggestionCardWrapper product={product} index={index} />
                    </Grid>
                ))}
            </Grid>

            {/* 3. FOOTER: Nút See all màu cam */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography 
                    component="a" 
                    href="/menu" 
                    sx={{ 
                        color: '#FF6B00', // Màu cam
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