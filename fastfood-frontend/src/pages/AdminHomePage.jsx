// src/pages/AdminHomePage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "../API/axiosConfig";

// Import Chart.js và components
import { Line, Doughnut } from "react-chartjs-2";
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
  Filler,
} from "chart.js";

// Import Icons cho KPI Boxes
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Đăng ký Filler để làm nền gradient/fill cho biểu đồ Line
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

// --- Component Card KPI (Giao diện UI/UX Hiện đại) ---
function KpiBox({ title, value, icon: IconComponent, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 120,
        borderRadius: 4,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        border: "1px solid",
        borderColor: "grey.100",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 14px 40px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="600"
          textTransform="uppercase"
          letterSpacing={1}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="p"
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          {value}
        </Typography>
      </Box>
      <Avatar
        sx={{
          bgcolor: alpha(color, 0.15),
          color: color,
          width: 60,
          height: 60,
        }}
      >
        <IconComponent sx={{ fontSize: 32 }} />
      </Avatar>
    </Paper>
  );
}

// --- Component Trang Dashboard Chính ---
function AdminHomePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/dashboard/stats");
        setStats(response.data.data);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard.");
        console.error("Lỗi tải dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 2. Cấu hình Dữ liệu và Giao diện Biểu đồ
  const salesChartData = {
    labels:
      stats?.charts.salesLast7Days.map((d) =>
        new Date(d.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
      ) || [],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: stats?.charts.salesLast7Days.map((d) => d.dailyRevenue) || [],
        fill: true,
        borderColor: "#3b82f6", // Xanh dương hiện đại
        backgroundColor: alpha("#3b82f6", 0.1), // Nền mờ phía dưới đường Line
        tension: 0.4, // Tạo độ cong mềm mại cho đường biểu diễn
        borderWidth: 3,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const topProductsChartData = {
    labels: stats?.charts.topProducts.map((p) => p.productName) || [],
    datasets: [
      {
        data: stats?.charts.topProducts.map((p) => p.totalSold) || [],
        backgroundColor: [
          "#3b82f6", // Xanh blue
          "#10b981", // Xanh lá
          "#f59e0b", // Vàng cam
          "#ef4444", // Đỏ
          "#8b5cf6", // Tím
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { borderDash: [5, 5], color: "#e5e7eb" },
        border: { display: false },
      },
    },
  };

  // 3. Xử lý trạng thái Loading và Error
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ m: 3, borderRadius: 2 }}>
        Không có dữ liệu để hiển thị.
      </Alert>
    );
  }

  // 4. Render Giao diện
  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, bgcolor: "#f9fafb", minHeight: "100vh" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800, color: "#111827" }}
        >
          Tổng Quan Hệ Thống
        </Typography>
      </Box>

      {/* --- KHU VỰC 1: 4 KPI BOXES --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiBox
            title="Doanh Thu (30 Ngày)"
            value={`${stats.kpi.totalRevenueMonth.toLocaleString("vi-VN")} ₫`}
            icon={AttachMoneyIcon}
            color="#10b981" // Xanh lá mượt
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiBox
            title="Đơn Hàng (30 Ngày)"
            value={stats.kpi.totalOrdersMonth}
            icon={ShoppingCartIcon}
            color="#3b82f6" // Xanh dương
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiBox
            title="Khách Mới (30 Ngày)"
            value={stats.kpi.newUsersMonth}
            icon={PersonAddIcon}
            color="#f59e0b" // Vàng hổ phách
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiBox
            title="Đơn Chờ Xử Lý"
            value={stats.kpi.pendingOrders}
            icon={PendingActionsIcon}
            color="#ef4444" // Đỏ báo hiệu
          />
        </Grid>
      </Grid>

      {/* --- KHU VỰC 2: BIỂU ĐỒ --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              color="#111827"
              gutterBottom
            >
              Biến động Doanh thu (7 ngày)
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Line
                data={salesChartData}
                options={{ ...chartOptions, maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              color="#111827"
              gutterBottom
            >
              Top 5 Món Bán Chạy
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Box sx={{ height: 250, width: "100%" }}>
                <Doughnut
                  data={topProductsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%", // Làm vòng tròn mỏng lại cực kỳ tinh tế
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { usePointStyle: true, padding: 20 },
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* --- KHU VỰC 3: BẢNG ĐƠN HÀNG MỚI --- */}
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 4,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="700" color="#111827">
            Đơn Hàng Mới Cần Xử Lý
          </Typography>
          <Button
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
            onClick={() => navigate("/admin/orders")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Xem tất cả
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Mã Đơn
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Khách Hàng
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#6b7280" }}>
                  Ngày Đặt
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Tổng Tiền
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "#6b7280" }}
                >
                  Hành Động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.lists.recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    Tuyệt vời! Hiện tại không có đơn hàng nào bị tồn đọng.
                  </TableCell>
                </TableRow>
              ) : (
                stats.lists.recentOrders.map((order) => (
                  <TableRow
                    hover
                    key={order.id}
                    sx={{ "& td": { borderBottom: "1px solid #f3f4f6" } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>#{order.id}</TableCell>
                    <TableCell>{order.shipping_full_name}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "#10b981" }}
                    >
                      {order.total_price.toLocaleString("vi-VN")} ₫
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          bgcolor: "#eff6ff",
                          color: "#1d4ed8",
                          "&:hover": { bgcolor: "#dbeafe" },
                        }}
                        onClick={() => navigate(`/admin/orders/${order.id}`)} // Có thể đổi lại link tùy router của bạn
                      >
                        Xử lý ngay
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
