// src/components/ProductCard.jsx
import React, { useState } from 'react';
import {
    Card, CardMedia, CardContent, CardActions, Typography, Button, Box,
    Skeleton, Badge
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';

function ProductCard({ product }) {
    const [imageLoaded, setImageLoaded] = useState(false); // Trạng thái tải ảnh
    const [adding, setAdding] = useState(false); // Trạng thái nút bấm loading
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // --- Xử lý thêm vào giỏ ---
    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Ngăn click xuyên qua card để vào trang chi tiết
        
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        setAdding(true);
        try {
            // Mặc định thêm 1 sản phẩm
            await addToCart(product, 1);
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
        } finally {
            // Timeout nhẹ để tạo hiệu ứng phản hồi cho người dùng
            setTimeout(() => setAdding(false), 300);
        }
    };

    const handleViewDetails = () => {
        navigate(`/product/${product.id}`);
    };

    if (!product) return null;

    return (
        <Badge
            badgeContent={product.is_hot ? "HOT" : null}
            color="error"
            sx={{ 
                width: '100%', 
                '& .MuiBadge-badge': { 
                    right: 10, 
                    top: 10, 
                    fontWeight: 'bold',
                    zIndex: 10 // Đảm bảo badge nằm trên ảnh
                } 
            }}
        >
            <Card 
                sx={{ 
                    height: '100%', 
                    width: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    // Hiệu ứng Hover giống hệt ComboCard
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6, 
                    },
                    borderRadius: 2, // Bo góc nhẹ
                    position: 'relative'
                }}
            >
                {/* === PHẦN ẢNH (Có Skeleton Loading) === */}
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', bgcolor: '#f0f0f0' }}>
                    {!imageLoaded && (
                        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
                    )}
                    <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(product.image_url) || '/placeholder.jpg'}
                        alt={product.name}
                        onClick={handleViewDetails}
                        onLoad={() => setImageLoaded(true)}
                        sx={{ 
                            cursor: 'pointer',
                            objectFit: 'cover',
                            display: imageLoaded ? 'block' : 'none',
                            transition: 'transform 0.5s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                    />
                </Box>

                {/* === PHẦN NỘI DUNG === */}
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Tên sản phẩm - In đậm giống ComboCard */}
                    <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h2" 
                        onClick={handleViewDetails}
                        sx={{ 
                            fontWeight: 'bold', 
                            cursor: 'pointer',
                            minHeight: '3rem', // Giữ chiều cao tên đồng đều (2 dòng)
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3
                        }}
                    >
                        {product.name}
                    </Typography>

                    {/* Mô tả - Cắt ngắn 1 dòng giống ComboCard */}
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {product.description || 'Mô tả đang cập nhật...'}
                    </Typography>
                    
                    {/* Giá tiền - Màu đỏ và in đậm giống ComboCard */}
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                            {parseInt(product.price).toLocaleString('vi-VN')}đ
                        </Typography>
                    </Box>
                </CardContent>

                {/* === PHẦN NÚT BẤM === */}
                <CardActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
                    <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={!adding && <AddShoppingCartIcon />} 
                        onClick={handleAddToCart}
                        disabled={adding}
                        sx={{
                            textTransform: 'none', // Giữ chữ thường tự nhiên
                            fontWeight: 600,
                            py: 1
                        }}
                    >
                        {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </Button>
                </CardActions>
            </Card>
        </Badge>
    );
}

export default ProductCard;