// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
  Pagination,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from'../API/axiosConfig';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Phân trang
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Tải danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        include_unavailable: true,
      };
      const response = await apiClient.get('/products', { params });
      setProducts(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Đổi trang
  const handlePageChange = (event, value) => {
    setSearchParams({ page: value.toString() });
    window.scrollTo(0, 0);
  };

  const handleAddProduct = () => navigate('/admin/products/add');
  const handleEditProduct = (id) => navigate(`/admin/products/edit/${id}`);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await apiClient.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError(err.response?.data?.message || 'Xóa sản phẩm thất bại.');
      }
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const updatedProduct = { ...product, is_available: !product.is_available };
      delete updatedProduct.category_name;

      delete updatedProduct.category_slug;

      await apiClient.put(`/products/${product.id}`, updatedProduct);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi toggle:', err);
      setError('Cập nhật trạng thái thất bại.');
    }
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Quản Lý Sản Phẩm
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Button
        variant="contained"
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddProduct}
        sx={{ mb: 3 }}
      >
        Thêm mới Sản phẩm
      </Button>

      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.200' } }}>
                <TableCell>ID</TableCell>
                <TableCell>Hình Ảnh</TableCell>
                <TableCell>Tên Sản Phẩm</TableCell>
                <TableCell>Danh Mục</TableCell>
                <TableCell align="right">Giá (VNĐ)</TableCell>
                <TableCell align="center">Có Sẵn</TableCell>
                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Không có sản phẩm nào.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow hover key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        sx={{
                          height: 40,
                          width: 40,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell align="right">
                      {parseInt(product.price).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={!!product.is_available}
                        onChange={() => handleToggleAvailability(product)}
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <DeleteIcon fontSize="small" />
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

export default AdminDashboard;
