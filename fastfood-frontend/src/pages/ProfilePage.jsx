// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
    Container, Grid, Paper, Typography, TextField, Button, 
    Tabs, Tab, Box, Alert, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider,
    Pagination, Stack, Avatar, InputAdornment, useTheme
} from '@mui/material'; 
import { useAuth } from '../context/AuthContext';
import apiClient from '../API/axiosConfig';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// --- 1. IMPORT COMPONENT BANNERPAGE VÀO ĐÂY ---
import BannerPage from '../components/BannerPage'; 

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div hidden={value !== index} {...other} style={{ width: '100%' }}>
            {value === index && <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>{children}</Box>}
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
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
    const theme = useTheme();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [message, setMessage] = useState({ type: '', content: '' });

    const primaryColor = '#A62828'; 

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
        window.scrollTo({ top: 350, behavior: 'smooth' }); // Cuộn xuống phần nội dung chính
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });
        try {
            await apiClient.put('/users/profile', formData);
            setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', content: 'Cập nhật thất bại. Vui lòng thử lại.' });
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
        try {
            await apiClient.put(`/orders/${orderId}/cancel`);
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
        // Thẻ Box ngoài cùng bọc lấy Banner tràn viền và Container nội dung
        <Box sx={{ width: '100%', pb: 8 }}>
            
            {/* --- 2. CHÈN BANNERPAGE VỚI TIÊU ĐỀ PHÙ HỢP --- */}
            <BannerPage title="Trang Cá Nhân" subtitle="Quản lý hồ sơ và theo dõi đơn hàng của bạn" />

            {/* --- NỘI DUNG CHÍNH BÊN DƯỚI (NẰM TRONG CONTAINER) --- */}
            <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 }, minHeight: '80vh' }}>
                
                {/* Header Cá nhân hóa (Giữ lại vì nó đẹp và thân thiện) */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 3 }}>
                    <Avatar 
                        sx={{ 
                            width: 80, height: 80, 
                            bgcolor: primaryColor,
                            fontSize: '2rem',
                            boxShadow: '0 8px 16px rgba(166, 40, 40, 0.2)'
                        }}
                    >
                        {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <AccountCircleIcon fontSize="large" />}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ fontFamily: '"Playfair Display", serif', color: '#2C2C2C' }}>
                            Xin chào, {formData.full_name || 'Khách hàng'}!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Thông tin tài khoản và lịch sử mua hàng.
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* MENU BÊN TRÁI CẢI TIẾN */}
                    <Grid item xs={12} md={3.5}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                borderRadius: 4, 
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: '#FAFAFA'
                            }}
                        >
                            <Tabs 
                                orientation="vertical" 
                                value={tabValue} 
                                onChange={(e, v) => setTabValue(v)} 
                                sx={{ 
                                    '& .MuiTab-root': { 
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                        borderRadius: 2, 
                                        minHeight: '50px',
                                        mb: 1, 
                                        textTransform: 'none', 
                                        fontSize: '1rem', 
                                        fontWeight: 600,
                                        color: 'text.secondary',
                                        transition: 'all 0.2s',
                                        px: 3,
                                    },
                                    '& .Mui-selected': { 
                                        bgcolor: 'rgba(166, 40, 40, 0.08)', 
                                        color: `${primaryColor} !important`,
                                    },
                                    '& .MuiTabs-indicator': { display: 'none' } 
                                }}
                            >
                                <Tab 
                                    icon={<PersonOutlineIcon sx={{ mr: 2 }} />} 
                                    iconPosition="start" 
                                    label="Hồ sơ cá nhân" 
                                />
                                <Tab 
                                    icon={<ReceiptLongIcon sx={{ mr: 2 }} />} 
                                    iconPosition="start" 
                                    label="Lịch sử đơn hàng" 
                                />
                            </Tabs>
                        </Paper>
                    </Grid>

                    {/* NỘI DUNG BÊN PHẢI */}
                    <Grid item xs={12} md={8.5}>
                        
                        {/* TAB 1: HỒ SƠ */}
                        <TabPanel value={tabValue} index={0}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 3, color: '#2C2C2C' }}>
                                    Thông tin tài khoản
                                </Typography>
                                
                                {message.content && (
                                    <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2 }}>
                                        {message.content}
                                    </Alert>
                                )}

                                <form onSubmit={handleUpdateProfile}>
                                    <Stack spacing={3}>
                                        <TextField 
                                            fullWidth 
                                            label="Họ và Tên" 
                                            variant="outlined"
                                            value={formData.full_name} 
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><PersonOutlineIcon color="action" /></InputAdornment>,
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                        <TextField 
                                            fullWidth 
                                            label="Số điện thoại" 
                                            variant="outlined"
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            name="phone" type="tel" autoComplete="tel" 
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon color="action" /></InputAdornment>,
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                        <TextField 
                                            fullWidth 
                                            label="Địa chỉ giao hàng mặc định" 
                                            multiline rows={3} 
                                            value={formData.address} 
                                            onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện..."
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><LocationOnOutlinedIcon color="action" /></InputAdornment>,
                                                sx: { borderRadius: 2 }
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <Button 
                                                variant="contained" 
                                                type="submit" 
                                                size="large"
                                                sx={{ 
                                                    bgcolor: primaryColor, 
                                                    borderRadius: 8, 
                                                    px: 4, py: 1.5,
                                                    fontWeight: 'bold',
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    '&:hover': { bgcolor: '#801f1f' },
                                                    boxShadow: '0 4px 12px rgba(166, 40, 40, 0.3)'
                                                }}
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </Box>
                                    </Stack>
                                </form>
                            </Paper>
                        </TabPanel>

                        {/* TAB 2: LỊCH SỬ ĐƠN HÀNG */}
                        <TabPanel value={tabValue} index={1}>
                            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAFAFA' }}>
                                    <Typography variant="h6" fontWeight="700" color="#2C2C2C">Đơn hàng của tôi</Typography>
                                </Box>
                                
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Mã Đơn</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Ngày Đặt</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Tổng Tiền</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Trạng Thái</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                        <ReceiptLongIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                                        <Typography variant="body1" color="text.secondary">Bạn chưa có đơn hàng nào.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                orders.map((order) => (
                                                    <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>#{order.id}</TableCell>
                                                        <TableCell>{formatDateTime(order.created_at)}</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', color: primaryColor }}>
                                                            {parseInt(order.total_price).toLocaleString()}đ
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={getStatusLabel(order.status)} 
                                                                color={getStatusColor(order.status)} 
                                                                size="small" 
                                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton onClick={() => handleViewOrder(order.id)} title="Xem chi tiết" sx={{ color: 'text.secondary', '&:hover': { color: primaryColor } }}>
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                            {order.status === 'pending' && (
                                                                <IconButton color="error" onClick={() => handleCancelOrder(order.id)} title="Hủy đơn hàng">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                            
                            {/* Phân trang */}
                            {orders.length > 0 && totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination 
                                        count={totalPages} 
                                        page={page} 
                                        onChange={handlePageChange} 
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                fontWeight: 600,
                                                '&.Mui-selected': { bgcolor: primaryColor, color: 'white', '&:hover': { bgcolor: '#801f1f' } }
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </TabPanel>
                    </Grid>
                </Grid>

                {/* MODAL CHI TIẾT ĐƠN HÀNG (Thiết kế như Receipt) */}
                <Dialog 
                    open={!!selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4 } }} 
                >
                    <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
                        <Typography variant="h5" fontWeight="800" sx={{ fontFamily: '"Playfair Display", serif', color: primaryColor }}>
                            Chi Tiết Đơn Hàng
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Mã đơn: #{selectedOrder?.id}
                        </Typography>
                    </DialogTitle>
                    
                    <DialogContent sx={{ px: 4, pb: 4 }}>
                        {selectedOrder && (
                            <Box sx={{ mt: 1 }}>
                                {/* Khối Thông tin Giao Hàng */}
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F9F9F9', borderRadius: 2, mb: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={7}>
                                            <Typography variant="caption" color="text.secondary" fontWeight="bold">NGƯỜI NHẬN</Typography>
                                            <Typography fontWeight="700" sx={{ mt: 0.5 }}>{selectedOrder.shipping_full_name}</Typography>
                                            <Typography variant="body2">{selectedOrder.shipping_phone}</Typography>
                                            <Typography variant="body2" color="text.secondary">{selectedOrder.shipping_address}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={5} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight="bold">TRẠNG THÁI</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip label={getStatusLabel(selectedOrder.status)} color={getStatusColor(selectedOrder.status)} size="small" sx={{ fontWeight: 'bold' }} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mt: 1 }}>THANH TOÁN</Typography>
                                            <Typography variant="body2" fontWeight="600">{selectedOrder.payment_method === 'cod' ? 'Tiền mặt (COD)' : 'VNPay'}</Typography>
                                            <Typography variant="caption" color={selectedOrder.is_paid ? 'success.main' : 'warning.main'} fontWeight="bold">
                                                {selectedOrder.is_paid ? '● Đã thanh toán' : '● Chưa thanh toán'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>DANH SÁCH MÓN</Typography>
                                
                                <List disablePadding>
                                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                        <ListItem key={index} sx={{ px: 0, py: 1.5, borderBottom: '1px dashed #E0E0E0' }}>
                                            <ListItemText 
                                                primary={<Typography fontWeight="600">{item.product_name}</Typography>} 
                                                secondary={<Typography variant="body2" color="text.secondary">SL: {item.quantity} x {parseInt(item.price).toLocaleString()}đ</Typography>} 
                                            />
                                            <Typography fontWeight="bold">{(item.quantity * item.price).toLocaleString()}đ</Typography>
                                        </ListItem>
                                    ))}
                                </List>

                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold" color="text.secondary">Tổng cộng</Typography>
                                    <Typography variant="h5" fontWeight="800" color={primaryColor}>
                                        {parseInt(selectedOrder.total_price).toLocaleString()}đ
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    
                    <DialogActions sx={{ px: 4, pb: 3, pt: 0, justifyContent: 'center' }}>
                        <Button 
                            onClick={() => setSelectedOrder(null)} 
                            variant="outlined"
                            sx={{ borderRadius: 8, px: 4, textTransform: 'none', fontWeight: 'bold', color: 'text.secondary', borderColor: '#E0E0E0' }}
                        >
                            Đóng lại
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default ProfilePage;