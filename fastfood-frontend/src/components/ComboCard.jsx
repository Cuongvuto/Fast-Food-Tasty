// src/components/ComboCard.jsx
import React from 'react';
import {
    Card, CardMedia, CardContent, CardActions, Typography, Button, Box
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';

function ComboCard({ combo }) {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Lấy ra các giá trị
    const originalPrice = parseFloat(combo.original_price);
    const finalPrice = parseFloat(combo.price);
    const discountAmount = parseFloat(combo.discount_amount);

    const handleAddToCart = () => {
        // Chuẩn bị item để thêm vào giỏ hàng
        // Quan trọng: Phải thêm cờ 'isCombo' và ID có tiền tố 'combo_'
        // để backend và CartContext (nếu cần) có thể phân biệt
        const itemToAdd = {
            ...combo,
            id: `combo_${combo.id}`, // Tạo ID duy nhất cho combo trong giỏ hàng
            isCombo: true,
            price: finalPrice // Đảm bảo giá là giá cuối cùng
        };
        // Mặc định thêm 1 combo
        addToCart(itemToAdd, 1); 
    };

    // Chuyển đến trang chi tiết (nếu bạn có trang chi tiết combo)
    const handleViewDetails = () => {
        // Tạm thời chưa làm trang chi tiết combo
        // navigate(`/combo/${combo.id}`);
        alert('Trang chi tiết combo chưa được cài đặt.');
    };

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6, // Nâng card lên khi hover
            }
        }}>
            <CardMedia
                component="img"
                height="200"
                image={getImageUrl(combo.image_url) || '/placeholder.jpg'}
                alt={combo.name}
                onClick={handleViewDetails}
                sx={{ cursor: 'pointer' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {combo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {combo.description || 'Mô tả combo...'}
                </Typography>
                
                {/* Phần hiển thị giá */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Giá cuối cùng (đã giảm) */}
                    <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                        {finalPrice.toLocaleString('vi-VN')}đ
                    </Typography>

                    {/* Giá gốc (gạch ngang) - Chỉ hiển thị nếu có giảm giá */}
                    {discountAmount > 0 && (
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ textDecoration: 'line-through' }}
                        >
                            {originalPrice.toLocaleString('vi-VN')}đ
                        </Typography>
                    )}
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                <Button 
                    variant="contained" 
                    startIcon={<AddShoppingCartIcon />} 
                    onClick={handleAddToCart}
                >
                    Thêm vào giỏ
                </Button>
            </CardActions>
        </Card>
    );
}

export default ComboCard;