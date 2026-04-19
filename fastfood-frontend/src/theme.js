// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F97316', // Màu cam chủ đạo (Giữ nguyên)
      contrastText: '#ffffff',
    },
    text: {
      primary: '#1F2937',   // Màu chữ chính (gần đen)
      secondary: '#6B7280', // Màu chữ phụ (xám)
    },
    background: {
      default: '#FFFFFF', // Màu nền chính (trắng)
      paper: '#FFFFFF',
    },
  },
  typography: {
    // 1. Font mặc định cho văn bản thường, mô tả, giá tiền (Sử dụng Open Sans)
    fontFamily: '"Open Sans", "Roboto", "Arial", sans-serif',
    
    // 2. Ép font nghệ thuật sang trọng cho toàn bộ các Thẻ Tiêu Đề (Sử dụng Playfair Display)
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h6: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px', // Bo tròn góc mặc định cho button (Giữ nguyên)
          textTransform: 'none',
          padding: '10px 25px',
          fontWeight: 600, // Thêm dòng này để chữ trong nút bấm (Open Sans) được in đậm vừa phải, dễ đọc hơn
        },
      },
    },
  },
});

export default theme;