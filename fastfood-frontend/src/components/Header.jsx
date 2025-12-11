// src/components/Header.jsx
import React, { useState } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, IconButton, Badge, 
    Box, Stack, Menu, MenuItem, Avatar, Tooltip, Divider 
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { cartItems } = useCart();
    // 1. Lấy thêm biến 'user' từ Context để hiển thị Avatar và check Admin
    const { isLoggedIn, logout, user } = useAuth(); 
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE CHO MENU USER ---
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
        navigate('/');
    };

    const handleCartClick = () => {
        // Cho phép xem giỏ hàng kể cả khi chưa login (tùy logic của bạn, ở đây giữ nguyên logic cũ)
        navigate('/cart'); 
    };

    // Hàm style cho Link (Giữ nguyên của bạn)
    const getLinkStyle = (path) => {
        const currentPath = location.pathname;
        const activeStyle = { color: 'text.primary', fontWeight: 600 };
        const inactiveStyle = { color: 'text.secondary' };
        if (path === '/') return currentPath === '/' ? activeStyle : inactiveStyle;
        return currentPath.startsWith(path) ? activeStyle : inactiveStyle;
    };

    return (
        <AppBar position="sticky" sx={{ bgcolor: 'white', px: { xs: 2, md: 10 } }}>
            <Toolbar sx={{ py: 2 }}>
                {/* LOGO */}
                <Typography variant="h5" component={RouterLink} to="/" sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'text.primary' }}>
                    TASTY
                </Typography>

                {/* MENU LINKS */}
                <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    <Button component={RouterLink} to="/" sx={getLinkStyle('/')}>Home</Button>
                    <Button component={RouterLink} to="/menu" sx={getLinkStyle('/menu')}>Menu</Button>
                    <Button component={RouterLink} to="/about" sx={getLinkStyle('/about')}>About Us</Button>
                    
                    {/* CART ICON */}
                    <IconButton onClick={handleCartClick} sx={{ color: 'text.primary' }}>
                        <Badge badgeContent={totalItems} color="primary">
                            <ShoppingCartOutlinedIcon />
                        </Badge>
                    </IconButton>
                </Stack>

                {/* AUTH BUTTONS / USER MENU */}
                <Box sx={{ ml: 3 }}>
                    {isLoggedIn ? (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Tài khoản">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    {/* Hiển thị Avatar: Nếu có ảnh thì hiện, không thì lấy chữ cái đầu */}
                                    <Avatar alt={user?.full_name} src="/static/images/avatar/2.jpg" sx={{ bgcolor: 'primary.main' }}>
                                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {/* Link đến trang Profile */}
                                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                                    <Typography textAlign="center">Tài khoản của tôi</Typography>
                                </MenuItem>

                                {/* Link đến trang Admin (Chỉ hiện nếu là Admin) */}
                                {user?.role === 'admin' && (
                                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin'); }}>
                                        <Typography textAlign="center" color="primary" fontWeight="bold">Trang quản trị</Typography>
                                    </MenuItem>
                                )}
                                
                                <Divider />

                                {/* Nút Đăng xuất */}
                                <MenuItem onClick={handleLogout}>
                                    <Typography textAlign="center" color="error">Đăng xuất</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        // Nếu chưa đăng nhập
                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" component={RouterLink} to="/login">
                                Login
                            </Button>
                            <Button variant="contained" component={RouterLink} to="/register">
                                Sign Up
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;