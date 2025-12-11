// src/pages/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
    Container, Typography, Grid, Card, CardMedia, CardContent, Box, Button, IconButton,
    Stack, Paper, useTheme, Dialog, DialogActions, DialogContent, DialogTitle,
    CircularProgress, Tooltip, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageHelper';

function CartPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { cartItems, removeFromCart } = useCart();
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleDeleteClick = (item) => {
        setDeleteDialog({ open: true, item });
    };

    const confirmDelete = () => {
        removeFromCart(deleteDialog.item.id);
        setDeleteDialog({ open: false, item: null });
    };

    // Hàm này đã điều hướng đúng đến /checkout
    const handleCheckout = async () => {
        setCheckoutLoading(true);
        setTimeout(() => {
            navigate('/checkout');
            setCheckoutLoading(false);
        }, 1000);
    };

    if (cartItems.length === 0) {
        return (
            <Container sx={{
                py: 8,
                textAlign: 'center',
                animation: 'fadeIn 0.8s ease-in-out',
                '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}>
                <ShoppingCartIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Giỏ hàng của bạn đang trống.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
                    Hãy thêm sản phẩm yêu thích vào giỏ để bắt đầu mua sắm!
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/menu')}
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': { transform: 'scale(1.05)' },
                    }}
                >
                    Khám phá menu
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{
            py: { xs: 4, md: 6 },
            animation: 'fadeIn 0.8s ease-in-out',
            '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
            },
        }}>
            <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    mb: 4,
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Giỏ hàng của bạn
            </Typography>

            <Grid container spacing={3}>
                {/* Danh sách sản phẩm */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Grid container spacing={0}>
                            {cartItems.map((item) => (
                                <Grid item xs={12} key={item.id}>
                                    <Card sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 0,
                                        boxShadow: 'none',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            bgcolor: theme.palette.grey[50],
                                            transform: 'translateX(5px)',
                                        },
                                        '&:not(:last-child)': { borderBottom: `1px solid ${theme.palette.grey[200]}` },
                                    }}>
                                        {/* Ảnh sản phẩm */}
                                        <CardMedia
                                            component="img"
                                            image={getImageUrl(item.image_url) || '/placeholder.jpg'} 
                                            alt={item.name}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                mr: 2,
                                            }}
                                        />

                                        {/* Thông tin sản phẩm */}
                                        <CardContent sx={{ flexGrow: 1, p: 0 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {item.name}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                                                <AttachMoneyIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Giá: {parseInt(item.price).toLocaleString('vi-VN')} VNĐ
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <AttachMoneyIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                                </Typography>
                                            </Stack>
                                        </CardContent>

                                        {/* Hiển thị số lượng */}
                                        <Typography variant="body1" sx={{ mr: 2, minWidth: '50px', textAlign: 'center' }}>
                                            SL: {item.quantity}
                                        </Typography>

                                        {/* Nút xóa */}
                                        <Tooltip title="Xóa sản phẩm">
                                            <IconButton
                                                onClick={() => handleDeleteClick(item)}
                                                color="error"
                                                sx={{
                                                    '&:hover': { transform: 'scale(1.1)', bgcolor: theme.palette.error.light },
                                                }}
                                                aria-label="Xóa"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Tổng cộng và thanh toán */}
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.secondary.light}10)`,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                            Tóm tắt đơn hàng
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h6">Tổng cộng:</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                    {totalPrice.toLocaleString('vi-VN')} VNĐ
                                </Typography>
                            </Stack>
                        </Stack>
                        {/* Nút này đã gọi đúng hàm handleCheckout */}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleCheckout} 
                            disabled={checkoutLoading}
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: 3,
                                py: 1.5,
                                transition: 'all 0.3s ease-in-out',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                },
                                '&:disabled': { opacity: 0.6 },
                            }}
                        >
                            {checkoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Tiến hành thanh toán'}
                        </Button>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog xác nhận xóa */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    Bạn có chắc muốn xóa "{deleteDialog.item?.name}" khỏi giỏ hàng?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, item: null })}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error">Xóa</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default CartPage;