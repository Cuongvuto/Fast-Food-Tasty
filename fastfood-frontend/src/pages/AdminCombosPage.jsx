// src/pages/AdminCombosPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, CircularProgress, Alert, Switch
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import apiClient from '../API/axiosConfig';

function AdminCombosPage() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Hàm để tải danh sách combo
    const fetchCombos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi API lấy danh sách combo cho admin (bao gồm cả combo ẩn)
            const response = await apiClient.get('/combos/admin');
            setCombos(response.data.data);
        } catch (err) {
            setError('Không thể tải danh sách combo.');
            console.error("Lỗi tải combo:", err);
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách khi component mount
    useEffect(() => {
        fetchCombos();
    }, []);

    const handleAddCombo = () => {
        navigate('/admin/combos/add');
    };

    const handleEditCombo = (id) => {
        navigate(`/admin/combos/edit/${id}`);
    };

    const handleDeleteCombo = async (id) => {
        if (window.confirm(`Bạn có chắc muốn xóa combo ID ${id}? (Sản phẩm con bên trong không bị xóa)`)) {
            try {
                await apiClient.delete(`/combos/${id}`);
                // Tải lại danh sách sau khi xóa thành công
                fetchCombos();
            } catch (err) {
                setError('Xóa combo thất bại. Vui lòng thử lại.');
                console.error("Lỗi xóa combo:", err);
            }
        }
    };

    // Hàm này để thay đổi nhanh trạng thái is_available (Tùy chọn nâng cao)
    const handleToggleAvailability = async (id, currentAvailability) => {
        // Đây là chức năng nâng cao, cần API PUT /api/combos/:id/status
        alert('Chức năng đổi nhanh trạng thái chưa được cài đặt. Vui lòng dùng nút Sửa.');
        // const newAvailability = !currentAvailability;
        // try {
        //     await apiClient.put(`/combos/${id}`, { is_available: newAvailability });
        //     fetchCombos();
        // } catch (err) {
        //     setError('Cập nhật trạng thái thất bại.');
        // }
    };

    return (
        <> {/* Fragment vì layout đã có ở AdminLayout */}
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quản Lý Combo
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddCombo}
                sx={{ mb: 3 }}
            >
                Thêm mới Combo
            </Button>

            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <TableContainer>
                    <Table stickyHeader aria-label="combo table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold', bgcolor: 'grey.200' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Hình Ảnh</TableCell>
                                <TableCell>Tên Combo</TableCell>
                                <TableCell align="right">Giá (VNĐ)</TableCell>
                                <TableCell>Mô tả</TableCell>
                                <TableCell align="center">Có sẵn</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                            ) : combos.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>Không có combo nào.</TableCell></TableRow>
                            ) : (
                                combos.map((combo) => (
                                    <TableRow hover key={combo.id}>
                                        <TableCell>{combo.id}</TableCell>
                                        <TableCell>
                                            <Box
                                                component="img"
                                                src={combo.image_url || '/placeholder.jpg'}
                                                alt={combo.name}
                                                sx={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{combo.name}</TableCell>
                                        <TableCell align="right">{parseInt(combo.price).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell
                                            sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                                            title={combo.description}
                                        >
                                            {combo.description}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={!!combo.is_available}
                                                // onChange={() => handleToggleAvailability(combo.id, combo.is_available)} // Tạm thời vô hiệu hóa
                                                readOnly // Chỉ hiển thị, không cho đổi trực tiếp
                                                color="success"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="warning" size="small" onClick={() => handleEditCombo(combo.id)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton color="error" size="small" onClick={() => handleDeleteCombo(combo.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    );
}

export default AdminCombosPage;