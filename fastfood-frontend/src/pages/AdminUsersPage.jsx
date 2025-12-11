// src/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Alert, Chip, Switch,
    Pagination, Stack // 1. IMPORT THÊM PAGINATION
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api/axiosConfig';

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 2. THÊM STATE PHÂN TRANG ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; // Số user mỗi trang (Cần khớp hoặc nhỏ hơn limit mặc định của backend)

    // Hàm fetch users (nhận tham số pageNumber)
    const fetchUsers = async (pageNumber = 1) => {
        setLoading(true);
        setError(null);
        try {
            // 3. GỌI API KÈM PAGE & LIMIT
            const response = await apiClient.get(`/users?page=${pageNumber}&limit=${LIMIT}`);
            
            // Backend trả về: { data: [...], pagination: { totalPages: ... } }
            setUsers(response.data.data || []);
            
            // Cập nhật tổng số trang
            setTotalPages(response.data.pagination?.totalPages || 1);
            setPage(pageNumber); // Cập nhật trang hiện tại

        } catch (err) {
            setError('Không thể tải danh sách người dùng.');
            console.error("Lỗi tải người dùng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1); // Mặc định tải trang 1 khi vào
    }, []);

    // Hàm xử lý khi bấm chuyển trang
    const handlePageChange = (event, value) => {
        fetchUsers(value);
    };

    const handleToggleAdmin = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await apiClient.put(`/users/${id}/role`, { role: newRole });
            alert(`Đã đổi quyền user ID ${id} thành ${newRole}`);
            fetchUsers(page); // Tải lại TRANG HIỆN TẠI
        } catch (err) {
            console.error("Lỗi đổi quyền user:", err);
            alert('Đổi quyền thất bại.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm(`Bạn có chắc muốn xóa người dùng ID ${id}? Hành động này không thể hoàn tác!`)) {
            try {
                await apiClient.delete(`/users/${id}`);
                alert(`Đã xóa người dùng ${id}`);
                
                // Nếu xóa hết item ở trang cuối, lùi về 1 trang
                if (users.length === 1 && page > 1) {
                    fetchUsers(page - 1);
                } else {
                    fetchUsers(page); // Tải lại TRANG HIỆN TẠI
                }
            } catch (err) {
                console.error("Lỗi xóa user:", err);
                // Hiển thị lỗi chi tiết từ backend nếu có
                const msg = err.response?.data?.message || 'Xóa người dùng thất bại.';
                alert(msg);
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Quản Lý Người Dùng
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2, pb: 2 }}>
                <TableContainer>
                    <Table stickyHeader aria-label="users table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.200' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Tên</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Vai trò</TableCell>
                                <TableCell align="center">Cấp quyền Admin</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>Không có người dùng nào.</TableCell></TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow hover key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role === 'admin' ? 'Admin' : 'User'}
                                                color={user.role === 'admin' ? 'error' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={user.role === 'admin'}
                                                onChange={() => handleToggleAdmin(user.id, user.role)}
                                                color="error"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="error" size="small" onClick={() => handleDeleteUser(user.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* --- 4. THANH PHÂN TRANG --- */}
                {!loading && users.length > 0 && (
                    <Stack spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handlePageChange} 
                            color="primary" 
                            showFirstButton 
                            showLastButton 
                        />
                    </Stack>
                )}
            </Paper>
        </>
    );
}

export default AdminUsersPage;