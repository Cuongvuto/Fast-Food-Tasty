// src/pages/AdminOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Chip,
  Select, MenuItem, FormControl, InputLabel, Pagination,
  Grid, TextField, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearchParams } from 'react-router-dom';
import apiClient from'../API/axiosConfig';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Hàm để lấy màu sắc chip dựa trên trạng thái
const getStatusChipColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'warning';
    case 'paid':
    case 'shipped':
      return 'info';
    case 'delivered':
    case 'completed':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

// Hàm hiển thị tên trạng thái
const getStatusDisplayName = (status) => {
  const statusMap = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    paid: 'Đã thanh toán',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    failed: 'Thất bại',
  };
  return statusMap[status?.toLowerCase()] || status || 'Không rõ';
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE CHO PHÂN TRANG VÀ LỌC ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);

  const [idFilter, setIdFilter] = useState(searchParams.get('searchId') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');

  const currentPage = parseInt(searchParams.get('page')) || 1;

  // --- FETCH ORDERS ---
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: searchParams.get('status'),
        searchId: searchParams.get('searchId'),
        date: searchParams.get('date'),
      };

      Object.keys(params).forEach(
        (key) => (params[key] == null || params[key] === '') && delete params[key]
      );

      const response = await apiClient.get('/orders', { params });
      setOrders(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 0);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
      setError('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  // --- HANDLERS ---
  const handleApplyFilter = () => {
    setSearchParams((prev) => {
      if (idFilter) prev.set('searchId', idFilter);
      else prev.delete('searchId');

      if (statusFilter) prev.set('status', statusFilter);
      else prev.delete('status');

      if (dateFilter) prev.set('date', dateFilter);
      else prev.delete('date');

      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearFilter = () => {
    setIdFilter('');
    setStatusFilter('');
    setDateFilter('');
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (event, value) => {
    setSearchParams((prev) => {
      prev.set('page', value.toString());
      return prev;
    });
  };

  const handleViewDetails = (id) => {
    alert(`Xem chi tiết đơn hàng ID: ${id} (chưa cài đặt)`);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      alert(`Đã cập nhật trạng thái đơn hàng ${orderId} thành ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Quản Lý Đơn Hàng
      </Typography>

      {/* --- BỘ LỌC --- */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 1, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Tìm theo ID Đơn hàng"
              variant="outlined"
              size="small"
              fullWidth
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                <MenuItem value="pending">Chờ xử lý</MenuItem>
                <MenuItem value="processing">Đang xử lý</MenuItem>
                <MenuItem value="shipped">Đang giao</MenuItem>
                <MenuItem value="delivered">Đã giao</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Lọc theo ngày"
              type="date"
              variant="outlined"
              size="small"
              fullWidth
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              startIcon={<SearchIcon />}
              fullWidth
            >
              Lọc
            </Button>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Button
              variant="outlined"
              onClick={handleClearFilter}
              startIcon={<ClearIcon />}
              fullWidth
            >
              Xóa
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* --- BẢNG ĐƠN HÀNG --- */}
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
        <TableContainer>
          <Table stickyHeader aria-label="orders table">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.200' } }}>
                <TableCell>ID Đơn Hàng</TableCell>
                <TableCell>Người Đặt</TableCell>
                <TableCell>Ngày Đặt</TableCell>
                <TableCell align="right">Tổng Tiền (VNĐ)</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell align="center">Cập nhật TT</TableCell>
                <TableCell align="center">Chi Tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Không có đơn hàng nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell sx={{ fontWeight: 500 }}>#{order.id}</TableCell>
                    <TableCell>{order.shipping_full_name || order.user_name || 'N/A'}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="right">
                      {parseInt(order.total_price).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplayName(order.status)}
                        color={getStatusChipColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status?.toLowerCase() || ''}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Update Status' }}
                        >
                          <MenuItem value="pending">Chờ xử lý</MenuItem>
                          <MenuItem value="processing">Đang xử lý</MenuItem>
                          <MenuItem value="shipped">Đang giao</MenuItem>
                          <MenuItem value="delivered">Đã giao</MenuItem>
                          <MenuItem value="cancelled">Đã hủy</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => handleViewDetails(order.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </>
  );
}

export default AdminOrdersPage;
