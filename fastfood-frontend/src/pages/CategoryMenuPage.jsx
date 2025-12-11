// src/pages/CategoryMenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook để lấy tham số từ URL
import apiClient from'../API/axiosConfig';
import { Container, Typography, Grid, CircularProgress, Alert, Box } from '@mui/material';
import ProductCard from '../components/ProductCard';

function CategoryMenuPage() {
    const { categorySlug } = useParams(); // Lấy slug từ URL, ví dụ: 'burger'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductsByCategory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Giả sử backend của bạn có API: /products?category=burger
                const response = await apiClient.get(`/products?category=${categorySlug}`);
                setProducts(response.data.data);
            } catch (err) {
                setError(`Không thể tải sản phẩm cho danh mục ${categorySlug}.`);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categorySlug]); // Chạy lại mỗi khi categorySlug trên URL thay đổi

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container sx={{ my: 5 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', textTransform: 'capitalize' }}>
                Thực Đơn: {categorySlug.replace('-', ' ')}
            </Typography>
            {products.length > 0 ? (
                <Grid container spacing={4}>
                    {products.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={3}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>Không có sản phẩm nào trong danh mục này.</Typography>
            )}
        </Container>
    );
}

export default CategoryMenuPage;