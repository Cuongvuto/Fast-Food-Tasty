// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import apiClient from '../API/axiosConfig';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    Container, Grid, Box, Typography, Button, IconButton, Stack,
    CircularProgress, Alert, Paper, Divider, useTheme, Breadcrumbs, Link
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import ProductCard from '../components/ProductCard'; 
import { getImageUrl } from '../utils/imageHelper';

function ProductDetailPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    // Effect to fetch main product details
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            setProduct(null);
            setRelatedProducts([]);
            try {
                const response = await apiClient.get(`/products/${productId}`);
                setProduct(response.data.data);
            } catch (err) {
                setError('Không tìm thấy sản phẩm hoặc đã xảy ra lỗi.');
                console.error("Fetch product error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // Effect to fetch related products
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (product && product.category_slug) {
                setLoadingRelated(true);
                try {
                    const response = await apiClient.get(`/products?category=${product.category_slug}`);
                    const related = response.data.data
                        .filter(p => p.id !== product.id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                } catch (err) {
                    console.error("Error fetching related products:", err);
                } finally {
                    setLoadingRelated(false);
                }
            }
        };
        fetchRelatedProducts();
    }, [product]);

    const handleQuantityChange = (delta) => {
        setQuantity(q => Math.max(1, q + delta));
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setAdding(true);
        try {
            await addToCart(product, quantity);
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ:", error);
        } finally {
            setTimeout(() => setAdding(false), 300);
        }
    };

    // === Loading State ===
    if (loading) return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <CircularProgress size={60} />
        </Container>
    );

    // === Error State ===
    if (error) return (
        <Container sx={{ py: 5, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            <Button variant="outlined" onClick={() => navigate('/menu')}>Quay lại Menu</Button>
        </Container>
    );

    // === Product Not Found ===
    if (!product) return (
        <Container sx={{ py: 5, textAlign: 'center' }}>
             <Typography variant="h6">Không có thông tin sản phẩm.</Typography>
             <Button variant="outlined" sx={{mt: 2}} onClick={() => navigate('/menu')}>Quay lại Menu</Button>
        </Container>
    );

    // === Main Render ===
    return (
        <Container sx={{ my: { xs: 3, md: 6 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
                 <Link component={RouterLink} underline="hover" color="inherit" to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Trang chủ
                </Link>
                <Link component={RouterLink} underline="hover" color="inherit" to="/menu" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Menu
                </Link>
                {product.category_slug && product.category_name && (
                    <Link component={RouterLink} underline="hover" color="inherit" to={`/menu/${product.category_slug}`} sx={{ textTransform: 'capitalize' }}>
                       {product.category_name}
                   </Link>
               )}
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            {/* Main Product Details - UPDATED LAYOUT */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: `1px solid ${theme.palette.grey[200]}` }}>
                <Grid container spacing={4} alignItems="flex-start">
                    {/* Column 1: Image */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            height: { xs: 300, sm: 400, md: 450 },
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            position: 'sticky', 
                            top: 100 
                        }}>
                            <img
                                src={getImageUrl(product.image_url) || '/placeholder-product.jpg'}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                    </Grid>

                    {/* Column 2: Info & Actions */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2.5}>
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{ fontWeight: 'bold', lineHeight: 1.3 }}
                            >
                                {product.name}
                            </Typography>
                             {product.category_name && (
                                <Typography variant="subtitle1" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                    Danh mục: {product.category_name}
                                </Typography>
                            )}
                            
                            {/* --- PHẦN GIÁ TIỀN ĐÃ SỬA --- */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        color: 'primary.main',
                                        fontFamily: '"Open Sans", sans-serif',
                                    }}
                                >
                                    {parseInt(product.price).toLocaleString('vi-VN')}đ
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* --- PHẦN MÔ TẢ ĐÃ SỬA --- */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mb: 1 }}>
                                    Chi tiết món ăn
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    {product.description || 'Sản phẩm này hiện chưa có mô tả chi tiết.'}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* --- PHẦN SỐ LƯỢNG --- */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mb: 1.5 }}>
                                    Số lượng
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 0.5, borderRadius: 50, bgcolor: theme.palette.grey[50], border: `1px solid ${theme.palette.grey[300]}`, maxWidth: 'fit-content' }}>
                                    <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity === 1} color="primary">
                                        <RemoveCircleOutlineIcon fontSize="large" />
                                    </IconButton>
                                    <Typography variant="h6" sx={{ minWidth: '30px', textAlign: 'center', fontWeight: 700, fontFamily: '"Open Sans", sans-serif' }}>
                                        {quantity}
                                    </Typography>
                                    <IconButton onClick={() => handleQuantityChange(1)} color="primary">
                                        <AddCircleOutlineIcon fontSize="large" />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {/* --- NÚT THÊM VÀO GIỎ ĐÃ SỬA MÀU --- */}
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={handleAddToCart} 
                                disabled={adding} 
                                sx={{ 
                                    mt: 4, 
                                    py: 1.8, 
                                    fontSize: '1.1rem', 
                                    fontWeight: 700, 
                                    textTransform: 'uppercase', 
                                    letterSpacing: 1,
                                    borderRadius: '50px',
                                    backgroundColor: 'primary.main', 
                                    color: 'white',
                                    boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)', 
                                    '&:hover': { 
                                        backgroundColor: '#ea580c', 
                                        transform: 'translateY(-2px)', 
                                        boxShadow: '0 12px 20px rgba(249, 115, 22, 0.4)' 
                                    }, 
                                    transition: 'all 0.3s ease' 
                                }}
                            >
                                {adding ? <CircularProgress size={26} color="inherit" /> : 'Thêm vào giỏ'}
                            </Button>
                        </Stack>
                    </Grid> 
                </Grid>
            </Paper>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <Box sx={{ mt: 8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
                        Sản phẩm tương tự
                    </Typography>
                    {loadingRelated ? (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                            <CircularProgress />
                         </Box>
                    ) : (
                        <Grid container spacing={4}>
                            {relatedProducts.map((relatedProd) => (
                                <Grid item key={relatedProd.id} xs={12} sm={6} md={3}>
                                    <ProductCard product={relatedProd} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}
        </Container>
    );
}

export default ProductDetailPage;