// src/components/Header.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Stack,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  Paper,
  InputBase,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Header() {
  // 1. CÁC HOOKS LUÔN ĐẶT TRÊN CÙNG
  const { cartItems } = useCart();
  const { isLoggedIn, logout, user } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 STATE CHO Ô TÌM KIẾM ĐẶT CHUẨN Ở ĐÂY
  const [searchQuery, setSearchQuery] = useState("");

  // STATE CHO MENU TÀI KHOẢN
  const [anchorElUser, setAnchorElUser] = useState(null);

  const primaryColor = "#A62828";

  // --- XỬ LÝ MENU TÀI KHOẢN ---
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate("/");
  };

  // --- XỬ LÝ TÌM KIẾM ---
  const handleSearch = (e) => {
    e.preventDefault(); // Chặn việc tải lại trang
    if (searchQuery.trim()) {
      // Chuyển sang trang menu và truyền từ khóa vào URL (VD: /menu?search=ga-ran)
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Tùy chọn: Xóa trắng ô tìm kiếm sau khi enter
    }
  };

  // --- HÀM ĐỔI MÀU MENU KHI ĐANG Ở TRANG ĐÓ ---
  const getLinkStyle = (path) => {
    const currentPath = location.pathname;
    const activeStyle = { color: primaryColor, fontWeight: 700 };
    const inactiveStyle = {
      color: "text.secondary",
      fontWeight: 500,
      "&:hover": { color: primaryColor },
    };
    if (path === "/") return currentPath === "/" ? activeStyle : inactiveStyle;
    return currentPath.startsWith(path) ? activeStyle : inactiveStyle;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        px: { xs: 2, md: 4, lg: 6 },
        borderBottom: "1px solid #E0E0E0",
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* 1. BÊN TRÁI: LOGO + MENU LINKS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "auto", lg: "35%" },
          }}
        >
          {/* LOGO */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "text.primary",
            }}
          >
            <LunchDiningIcon
              sx={{
                fontSize: 40,
                color: primaryColor,
                mr: 1,
                "&:hover": { animation: "shake 0.5s ease-in-out infinite" },
                "@keyframes shake": {
                  "0%": { transform: "rotate(0deg)" },
                  "25%": { transform: "rotate(-15deg)" },
                  "50%": { transform: "rotate(0deg)" },
                  "75%": { transform: "rotate(15deg)" },
                  "100%": { transform: "rotate(0deg)" },
                },
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "900",
                letterSpacing: 1,
                color: primaryColor,
                display: { xs: "none", sm: "block" },
              }}
            >
              TASTY
            </Typography>
          </Box>

          {/* MENU LINKS */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" }, ml: { md: 3, lg: 5 } }}
          >
            <Button
              component={RouterLink}
              to="/"
              sx={{
                ...getLinkStyle("/"),
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/menu"
              sx={{
                ...getLinkStyle("/menu"),
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Menu
            </Button>
            <Button
              component={RouterLink}
              to="/about"
              sx={{
                ...getLinkStyle("/about"),
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              About
            </Button>
          </Stack>
        </Box>

        {/* 2. Ở GIỮA: THANH TÌM KIẾM */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            width: { xs: "100%", lg: "30%" },
          }}
        >
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              maxWidth: 500,
              borderRadius: 8,
              bgcolor: "#F3F4F6",
              transition: "all 0.3s ease",
              border: "1px solid transparent",
              "&:hover": { bgcolor: "#E5E7EB" },
              "&:focus-within": {
                bgcolor: "#fff",
                border: `1px solid ${primaryColor}`,
                boxShadow: `0 0 0 3px rgba(166, 40, 40, 0.1)`,
              },
            }}
          >
            <InputBase
              sx={{ ml: 2, flex: 1, fontSize: "0.95rem" }}
              placeholder="Bạn muốn ăn gì hôm nay?..."
              value={searchQuery} // Gắn giá trị ô input vào state
              onChange={(e) => setSearchQuery(e.target.value)} // Cập nhật state khi gõ
            />
            <IconButton type="submit" sx={{ p: "10px", color: primaryColor }}>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* 3. BÊN PHẢI: CART & USER MENU */}
        <Box
          sx={{
            width: { xs: "auto", lg: "35%" },
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* CART */}
          <IconButton
            onClick={() => navigate("/cart")}
            sx={{
              color: "text.secondary",
              mr: { xs: 1, sm: 2 },
              "&:hover": {
                color: primaryColor,
                bgcolor: "rgba(166, 40, 40, 0.08)",
              },
            }}
          >
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />
            </Badge>
          </IconButton>

          {/* AUTH */}
          {isLoggedIn ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Tài khoản">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0,
                    border: `2px solid transparent`,
                    "&:hover": { borderColor: primaryColor },
                  }}
                >
                  <Avatar
                    src="/static/images/avatar/2.jpg"
                    sx={{
                      bgcolor: primaryColor,
                      width: 40,
                      height: 40,
                      fontWeight: "bold",
                    }}
                  >
                    {user?.full_name
                      ? user.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  elevation: 3,
                  sx: { borderRadius: 3, minWidth: 200 },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    navigate("/profile");
                  }}
                  sx={{ py: 1.5 }}
                >
                  <Typography textAlign="center" fontWeight="500">
                    Tài khoản của tôi
                  </Typography>
                </MenuItem>
                {user?.role === "admin" && (
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/admin");
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Typography
                      textAlign="center"
                      color="primary"
                      fontWeight="bold"
                    >
                      Trang quản trị
                    </Typography>
                  </MenuItem>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <Typography textAlign="center" color="error" fontWeight="500">
                    Đăng xuất
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                component={RouterLink}
                to="/login"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  textTransform: "none",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                disableElevation
                sx={{
                  bgcolor: primaryColor,
                  borderRadius: 6,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                  "&:hover": { bgcolor: "#801f1f" },
                }}
              >
                Đăng ký
              </Button>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
