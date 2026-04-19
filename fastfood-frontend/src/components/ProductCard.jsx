// src/components/ProductCard.jsx
import React, { useState } from 'react';
import {
    Card, CardMedia, CardContent, Typography, Button, Box, Skeleton, Badge, CircularProgress
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';

function ProductCard({ product }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [adding, setAdding] = useState(false);
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = async (e) => {
        e.stopPropagation(); 
        
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        setAdding(true);
        try {
            await addToCart(product, 1);
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
        } finally {
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
                height: '100%', 
                display: 'flex',
                '& .MuiBadge-badge': { 
                    right: 15,
                    top: 15, 
                    fontWeight: 'bold',
                    zIndex: 10
                } 
            }}
        >
            <Card 
                elevation={0} // Bỏ bóng đổ mặc định, dùng viền mỏng giống Lotteria
                sx={{ 
                    height: '100%', 
                    width: '100%',
                    display: 'flex', 
                    maxWidth: 250, 
                    margin: '0 auto',
                    flexDirection: 'column',
                    borderRadius: 2, // Bo góc nhẹ
                    position: 'relative',
                    bgcolor: '#ffffff',
                    border: '1px solid #f0f0f0', // Viền mỏng phân cách các card
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
                    }
                }}
            >
                {/* === PHẦN ẢNH (TỶ LỆ CHÍNH XÁC 213x149) === */}
                <Box 
                    sx={{ 
                        position: 'relative', 
                        width: '100%', 
                        aspectRatio: '213 / 149', // Ép đúng tỷ lệ ảnh từ DevTools của bạn
                        flexShrink: 0, 
                        overflow: 'hidden', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: '13px' // Padding xung quanh ảnh
                    }}
                >
                    {!imageLoaded && (
                        <Skeleton 
                            variant="circular" 
                            animation="wave" 
                            sx={{ position: 'absolute', width: '80%', height: '80%' }}
                        />
                    )}
                    <CardMedia
                        component="img"
                        image={getImageUrl(product.image_url) || '/placeholder.jpg'}
                        alt={product.name}
                        onClick={handleViewDetails}
                        onLoad={() => setImageLoaded(true)}
                        sx={{ 
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            objectFit: 'contain', // Giữ nguyên món ăn không bị cắt mép
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'transform 0.4s ease, opacity 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)' } 
                        }}
                    />
                </Box>

                {/* === PHẦN NỘI DUNG (CĂN TRÁI, PADDING 13px) === */}
                <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: '13px', // Đúng padding 13px như trong ảnh DevTools
                    '&:last-child': { pb: '13px' }, // Ghi đè padding-bottom mặc định của thẻ CardContent MUI
                    textAlign: 'left' // Lotteria căn trái nội dung
                }}>
                    {/* Tên sản phẩm */}
                    <Typography 
                        gutterBottom 
                        variant="subtitle1" 
                        component="h2" 
                        onClick={handleViewDetails}
                        sx={{ 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            color: '#3f72af', // Màu xanh lam giống trong ảnh (bạn có thể đổi về màu đen #333 nếu muốn)
                            fontSize: '1.05rem',
                            lineHeight: 1.3,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {product.name}
                    </Typography>

                    {/* Mô tả phụ (Dòng chữ xám nhỏ) */}
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#8fa0b5', 
                            fontSize: '0.85rem',
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {product.description || 'Lotteria tạm thời thay Cà chua bằng Dưa leo'}
                    </Typography>
                    
                    {/* Hàng chứa Giá tiền & Nút Thêm (Nằm dưới cùng) */}
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700, 
                                color: '#f97316', // Đổi màu giá tiền
                                fontSize: '1.25rem',
                            }}
                        >
                            {parseInt(product.price).toLocaleString('vi-VN')} đ
                        </Typography>

                        {/* Nút dấu + hình vuông */}
                        <Button 
                            variant="contained" 
                            onClick={handleAddToCart}
                            disabled={adding}
                            sx={{
                                minWidth: 0,
                                width: 38, // Nút vuông nhỏ
                                height: 38,
                                p: 0,
                                borderRadius: '8px',
                                bgcolor: '#f97316', // Đổi màu nền nút
                                color: 'white',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#ea580c', boxShadow: 'none' } // Đổi màu hover cho hợp tông cam
                            }}
                        >
                            {adding ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <span style={{ fontSize: '1.8rem', lineHeight: 0, paddingBottom: '3px' }}>+</span>
                            )}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Badge>
    );
}

export default ProductCard;