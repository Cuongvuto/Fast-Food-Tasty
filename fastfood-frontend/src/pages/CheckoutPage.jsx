// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Typography, Paper, TextField, RadioGroup, FormControlLabel,
    Radio, Button, Divider, useTheme, List, ListItem, ListItemAvatar,
    Avatar, ListItemText, Alert, Stack, CircularProgress, Box, InputAdornment, IconButton
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DiscountIcon from '@mui/icons-material/Discount';
import ClearIcon from '@mui/icons-material/Clear';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from'../API/axiosConfig';

function CheckoutPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { user, isLoggedIn, loading: authLoading } = useAuth();

    // State form
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('cod'); 
    const [address, setAddress] = useState(''); 
    const [phone, setPhone] = useState('');    
    const [note, setNote] = useState('');
    const [fullName, setFullName] = useState(''); 

    // --- STATE VOUCHER ---
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null); 
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherMessage, setVoucherMessage] = useState({ type: '', text: '' }); 

    // State xử lý
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState('');

    // Auto-fill
    useEffect(() => {
        if (!authLoading && user) {
            setFullName(user.full_name || '');
            setPhone(user.phone_number || user.phone || '');
            setAddress(user.address || '');
        }
    }, [user, authLoading]);

    // Tính toán tiền
    const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingPrice = shippingMethod === 'standard' ? 25000 : 30000;
    
    // Tổng tiền hiển thị
    const totalPrice = appliedVoucher 
        ? (Number(appliedVoucher.finalTotal) + shippingPrice)
        : (itemsPrice + shippingPrice);

    // --- XỬ LÝ ÁP DỤNG VOUCHER ---
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        setVoucherMessage({ type: '', text: '' });

        try {
            const res = await apiClient.post('/vouchers/apply', {
                code: voucherCode,
                cartTotal: itemsPrice
            });

            setAppliedVoucher(res.data.data);
            setVoucherMessage({ type: 'success', text: `Đã áp dụng mã: giảm ${parseInt(res.data.data.discountAmount).toLocaleString()}đ` });

        } catch (err) {
            console.error("Lỗi voucher:", err);
            setAppliedVoucher(null);
            setVoucherMessage({ type: 'error', text: err.response?.data?.message || 'Mã không hợp lệ' });
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherMessage({ type: '', text: '' });
    };

    // --- XỬ LÝ ĐẶT HÀNG ---
    const handlePlaceOrder = async () => {
        setError('');

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (!address.trim() || !phone.trim() || !fullName.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin giao hàng.');
            return;
        }

        setPlacingOrder(true);

        const orderData = {
            userId: user.id,
            items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
            shippingFullName: fullName,
            shippingAddress: address,
            shippingPhone: phone,
            paymentMethod: paymentMethod, 
            shippingMethod: shippingMethod,
            itemsPrice: itemsPrice,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice, 
            note: note,
            voucherCode: appliedVoucher ? appliedVoucher.code : null 
        };

        try {
            const orderRes = await apiClient.post('/orders', orderData);
            const newOrderId = orderRes.data.orderId;

            if (paymentMethod === 'cod') {
                clearCart();
                navigate('/order-success'); 
            } 
            else if (paymentMethod === 'banking') {
                try {
                    const paymentRes = await apiClient.post('/payment/create_payment_url', {
                        orderId: newOrderId,
                        amount: totalPrice,
                        orderInfo: `Thanh toan don hang #${newOrderId}`
                    });
                    if (paymentRes.data.paymentUrl) {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        throw new Error("Không nhận được link thanh toán");
                    }
                } catch (payErr) {
                    console.error("Lỗi VNPay:", payErr);
                    setError('Không thể kết nối cổng thanh toán VNPay.');
                    setPlacingOrder(false);
                }
            }

        } catch (err) {
            console.error("Lỗi khi đặt hàng:", err);
            setError(err.response?.data?.message || 'Đặt hàng không thành công.');
            setPlacingOrder(false);
        }
    };

    useEffect(() => {
        if (!authLoading && cartItems.length === 0 && !placingOrder) {
            navigate('/');
        }
    }, [cartItems, navigate, placingOrder, authLoading]);

    if (authLoading) return <CircularProgress />;
    if (cartItems.length === 0 && !placingOrder) return null;

    return (
        <Container sx={{ my: { xs: 3, md: 5 } }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
                Thanh Toán
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                
                {/* === CỘT TRÁI: THÔNG TIN (Size 8) === */}
                {/* SỬA Ở ĐÂY: Dùng prop 'size' thay vì 'item xs md' */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <LocalShippingIcon sx={{ mr: 1 }} /> Thông tin giao hàng
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="Họ và Tên" fullWidth required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={placingOrder} size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Số điện thoại" fullWidth required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={placingOrder} size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Địa chỉ nhận hàng" fullWidth required value={address} onChange={(e) => setAddress(e.target.value)} disabled={placingOrder} size="small" />
                            </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>Hình thức giao hàng</Typography>
                        <RadioGroup row value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                            <FormControlLabel value="standard" control={<Radio size="small" disabled={placingOrder} />} label="Tiêu chuẩn (25k)" />
                            <FormControlLabel value="express" control={<Radio size="small" disabled={placingOrder} />} label="Nhanh (30k)" />
                        </RadioGroup>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                            <PaymentIcon sx={{ mr: 1 }} /> Hình thức thanh toán
                        </Typography>
                        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <FormControlLabel value="cod" control={<Radio disabled={placingOrder} />} label="Thanh toán khi nhận hàng (COD)" />
                            <FormControlLabel value="banking" control={<Radio disabled={placingOrder} />} label="Thanh toán Online qua VNPay (ATM/Banking)" />
                        </RadioGroup>
                    </Paper>
                </Grid>

                {/* === CỘT PHẢI: ĐƠN HÀNG (Size 4 - Sticky) === */}
               
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        boxShadow: 3, 
                        position: 'sticky', 
                        top: 100,           
                        height: 'fit-content' 
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 2 }}>
                            <ShoppingBagIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Đơn hàng
                        </Typography>
                        
                        <List disablePadding sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                            {cartItems.map((item) => (
                                <ListItem key={item.id} disableGutters divider sx={{ py: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar variant="rounded" src={getImageUrl(item.image_url)} alt={item.name} sx={{ width: 50, height: 50, mr: 1.5 }}/>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={item.name} 
                                        secondary={`x${item.quantity}`} 
                                        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>

                        <TextField 
                            label="Ghi chú" 
                            fullWidth multiline rows={2} 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            sx={{ mb: 2 }} 
                            size="small"
                            disabled={placingOrder}
                        />

                        {/* Nhập Voucher */}
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Stack direction="row" spacing={1}>
                                <TextField 
                                    size="small" 
                                    fullWidth 
                                    placeholder="Mã giảm giá" 
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedVoucher || voucherLoading || placingOrder}
                                    InputProps={{
                                        endAdornment: appliedVoucher && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={handleRemoveVoucher}><ClearIcon fontSize="small" /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={handleApplyVoucher}
                                    disabled={!!appliedVoucher || voucherLoading || !voucherCode}
                                    sx={{ minWidth: 80 }}
                                >
                                    {voucherLoading ? <CircularProgress size={16} color="inherit"/> : 'Áp dụng'}
                                </Button>
                            </Stack>
                            {voucherMessage.text && (
                                <Typography variant="caption" color={voucherMessage.type === 'error' ? 'error' : 'success.main'} sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                                    {voucherMessage.text}
                                </Typography>
                            )}
                        </Box>

                        <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{itemsPrice.toLocaleString('vi-VN')}đ</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Vận chuyển</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{shippingPrice.toLocaleString('vi-VN')}đ</Typography>
                            </Stack>
                            
                            {appliedVoucher && (
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="success.main">Voucher giảm</Typography>
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                        -{parseInt(appliedVoucher.discountAmount).toLocaleString('vi-VN')}đ
                                    </Typography>
                                </Stack>
                            )}

                            <Divider />
                            <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mt: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tổng tiền</Typography>
                                <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                                    {totalPrice.toLocaleString('vi-VN')}đ
                                </Typography>
                            </Stack>
                            
                            <Button
                                variant="contained" fullWidth size="large" 
                                onClick={handlePlaceOrder} 
                                disabled={placingOrder || cartItems.length === 0 || authLoading}
                                sx={{ 
                                    mt: 2, fontWeight: 'bold', 
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    boxShadow: 3
                                }}
                            >
                                {placingOrder ? <CircularProgress size={24} color="inherit" /> : 'ĐẶT HÀNG'}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CheckoutPage;