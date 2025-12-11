// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Paper, Typography, TextField, Button, 
    Tabs, Tab, Box, Alert, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
    Pagination, Stack 
} from '@mui/material'; // <-- SỬA: Quay về import Grid thường
import { useAuth } from '../context/AuthContext';
import apiClient from'../API/axiosConfig';

import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div hidden={value !== index} {...other} style={{ padding: '20px 0' }}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'primary';
        case 'completed': return 'success';
        case 'cancelled': return 'error';
        default: return 'default';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'processing': return 'Đang chuẩn bị';
        case 'shipped': return 'Đang giao';
        case 'delivered': return 'Đã giao';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

function ProfilePage() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [message, setMessage] = useState({ type: '', content: '' });

    // State Profile
    const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });

    // State Orders
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const LIMIT_PER_PAGE = 5; 

    // Load dữ liệu
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone_number || user.phone || '', 
                address: user.address || ''
            });
            fetchOrders(1);
        }
    }, [user]);

    const fetchOrders = async (pageNumber = 1) => {
        try {
            const res = await apiClient.get(`/orders/my-orders?page=${pageNumber}&limit=${LIMIT_PER_PAGE}`);
            setOrders(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setPage(pageNumber);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        }
    };

    const handlePageChange = (event, value) => {
        fetchOrders(value);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });
        try {
            await apiClient.put('/users/profile', formData);
            setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
        } catch (error) {
            setMessage({ type: 'error', content: 'Cập nhật thất bại. Vui lòng thử lại.' });
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
        try {
            await apiClient.put(`/orders/${orderId}/cancel`);
            alert('Đã hủy đơn hàng');
            fetchOrders(page); 
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const res = await apiClient.get(`/orders/${orderId}`);
            setSelectedOrder(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container sx={{ py: 5, minHeight: '80vh' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Tài khoản của tôi
            </Typography>

            {/* SỬA LẠI CẤU TRÚC GRID CHUẨN (Dùng được cho cả v5 và v6) */}
            <Grid container spacing={4}>
                {/* MENU BÊN TRÁI */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3}>
                        <Tabs orientation="vertical" value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}>
                            <Tab label="Hồ sơ cá nhân" />
                            <Tab label="Lịch sử đơn hàng" />
                        </Tabs>
                    </Paper>
                </Grid>

                {/* NỘI DUNG BÊN PHẢI */}
                <Grid item xs={12} md={9}>
                    
                    {/* TAB 1: HỒ SƠ */}
                    <TabPanel value={tabValue} index={0}>
                        <Paper elevation={3} sx={{ p: 4 }}>
                            <Typography variant="h6" gutterBottom>Thông tin tài khoản</Typography>
                            {message.content && <Alert severity={message.type} sx={{ mb: 2 }}>{message.content}</Alert>}
                            <form onSubmit={handleUpdateProfile}>
                                <TextField fullWidth label="Họ và Tên" margin="normal" 
                                    value={formData.full_name} 
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                                />
                                <TextField fullWidth label="Số điện thoại" margin="normal" 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                />
                                <TextField fullWidth label="Địa chỉ mặc định" margin="normal" multiline rows={2} 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                    helperText="Địa chỉ này sẽ được tự động điền khi thanh toán" 
                                />
                                <Button variant="contained" type="submit" sx={{ mt: 2 }}>Lưu thay đổi</Button>
                            </form>
                        </Paper>
                    </TabPanel>

                    {/* TAB 2: LỊCH SỬ ĐƠN HÀNG */}
                    <TabPanel value={tabValue} index={1}>
                        <TableContainer component={Paper} elevation={3}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Mã đơn</TableCell>
                                        <TableCell>Ngày đặt</TableCell>
                                        <TableCell>Tổng tiền</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell align="right">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">Bạn chưa có đơn hàng nào.</TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>#{order.id}</TableCell>
                                                <TableCell>{formatDateTime(order.created_at)}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{parseInt(order.total_price).toLocaleString()}đ</TableCell>
                                                <TableCell>
                                                    <Chip label={getStatusLabel(order.status)} color={getStatusColor(order.status)} size="small" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="primary" onClick={() => handleViewOrder(order.id)} title="Xem chi tiết"><VisibilityIcon /></IconButton>
                                                    {order.status === 'pending' && (
                                                        <IconButton color="error" onClick={() => handleCancelOrder(order.id)} title="Hủy đơn hàng"><DeleteIcon /></IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        {orders.length > 0 && (
                            <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
                            </Stack>
                        )}
                    </TabPanel>
                </Grid>
            </Grid>

            {/* MODAL CHI TIẾT */}
            <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
                    Chi tiết đơn hàng #{selectedOrder?.id}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedOrder && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Ngày đặt hàng:</Typography>
                                <Typography fontWeight="bold" sx={{ mb: 2, fontSize: '1.1rem', color: 'primary.main' }}>
                                    {formatDateTime(selectedOrder.created_at)}
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">Người nhận:</Typography>
                                <Typography fontWeight="bold">{selectedOrder.shipping_full_name}</Typography>
                                <Typography>{selectedOrder.shipping_phone}</Typography>
                                <Typography>{selectedOrder.shipping_address}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="subtitle2" color="text.secondary">Thanh toán:</Typography>
                                <Typography>{selectedOrder.payment_method === 'cod' ? 'Tiền mặt (COD)' : 'VNPay'}</Typography>
                                <Chip label={selectedOrder.is_paid ? 'Đã thanh toán' : 'Chưa thanh toán'} color={selectedOrder.is_paid ? 'success' : 'warning'} size="small" sx={{ mt: 0.5 }} />
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Trạng thái đơn:</Typography>
                                    <Typography color={getStatusColor(selectedOrder.status) + ".main"} fontWeight="bold">{getStatusLabel(selectedOrder.status)}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Sản phẩm:</Typography>
                                <List disablePadding>
                                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                        <ListItem key={index} divider sx={{ px: 0 }}>
                                            <ListItemText primary={item.product_name} secondary={`SL: ${item.quantity} x ${parseInt(item.price).toLocaleString()}đ`} />
                                            <Typography fontWeight="bold">{(item.quantity * item.price).toLocaleString()}đ</Typography>
                                        </ListItem>
                                    ))}
                                </List>
                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Typography variant="h6" color="error">Tổng cộng: {parseInt(selectedOrder.total_price).toLocaleString()}đ</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedOrder(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default ProfilePage;