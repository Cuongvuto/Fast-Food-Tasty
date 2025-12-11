// src/pages/AdminHomePage.jsx
import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Icon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from'../API/axiosConfig';

// Import Chart.js và components
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Import Icons cho KPI Boxes
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- Component Card KPI (Tái sử dụng) ---
function KpiBox({ title, value, icon, color = 'primary.main' }) {
    return (
        <Paper 
            sx={{ 
                p: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                height: 140,
                boxShadow: 3,
                borderRadius: 2,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                }
            }}
        >
            <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
            <Box sx={{ 
                bgcolor: color, 
                color: 'white', 
                borderRadius: '50%', 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2
            }}>
                <Icon component={icon} sx={{ fontSize: 32 }} />
            </Box>
        </Paper>
    );
}

// --- Component Trang Dashboard Chính ---
function AdminHomePage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 1. Fetch dữ liệu từ API /api/dashboard/stats
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/dashboard/stats');
                setStats(response.data.data);
            } catch (err) {
                setError('Không thể tải dữ liệu dashboard.');
                console.error("Lỗi tải dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // 2. Xử lý dữ liệu cho biểu đồ (nếu stats đã có)
    const salesChartData = {
        labels: stats?.charts.salesLast7Days.map(d => 
            new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        ) || [],
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: stats?.charts.salesLast7Days.map(d => d.dailyRevenue) || [],
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
            },
        ],
    };

    const topProductsChartData = {
        labels: stats?.charts.topProducts.map(p => p.productName) || [],
        datasets: [
            {
                label: 'Số lượng bán',
                data: stats?.charts.topProducts.map(p => p.totalSold) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                hoverOffset: 4,
            },
        ],
    };

    // 3. Xử lý trạng thái Loading và Error
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }

    if (!stats) {
        return <Alert severity="info" sx={{ m: 3 }}>Không có dữ liệu để hiển thị.</Alert>;
    }

    // 4. Render Giao diện
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Dashboard Tổng Quan
            </Typography>

            {/* --- KHU VỰC 1: 4 KPI BOXES --- */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiBox 
                        title="Doanh thu (30d)" 
                        value={`${stats.kpi.totalRevenueMonth.toLocaleString('vi-VN')}đ`}
                        icon={AttachMoneyIcon}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiBox 
                        title="Đơn hàng (30d)" 
                        value={stats.kpi.totalOrdersMonth}
                        icon={ShoppingCartIcon}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiBox 
                        title="Khách hàng mới (30d)" 
                        value={stats.kpi.newUsersMonth}
                        icon={PersonAddIcon}
                        color="warning.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KpiBox 
                        title="Đơn chờ xử lý" 
                        value={stats.kpi.pendingOrders}
                        icon={PendingActionsIcon}
                        color="error.main"
                    />
                </Grid>
            </Grid>

            {/* --- KHU VỰC 2: BIỂU ĐỒ --- */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Biểu đồ Doanh thu (Line) */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Doanh thu 7 ngày qua</Typography>
                        <Line data={salesChartData} options={{ responsive: true }} />
                    </Paper>
                </Grid>
                {/* Biểu đồ Top sản phẩm (Doughnut) */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Top 5 Sản phẩm Bán chạy</Typography>
                        <Doughnut data={topProductsChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                    </Paper>
                </Grid>
            </Grid>

            {/* --- KHU VỰC 3: ĐƠN HÀNG MỚI --- */}
            <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Đơn hàng mới cần xử lý</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Đơn</TableCell>
                                <TableCell>Khách hàng</TableCell>
                                <TableCell>Ngày đặt</TableCell>
                                <TableCell align="right">Tổng tiền</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.lists.recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">Không có đơn hàng nào chờ xử lý.</TableCell>
                                </TableRow>
                            ) : (
                                stats.lists.recentOrders.map((order) => (
                                    <TableRow hover key={order.id}>
                                        <TableCell>#{order.id}</TableCell>
                                        <TableCell>{order.shipping_full_name}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell align="right">{order.total_price.toLocaleString('vi-VN')}đ</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                onClick={() => navigate('/admin/orders')} // Chuyển đến trang quản lý đơn hàng
                                            >
                                                Xem
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}

export default AdminHomePage;