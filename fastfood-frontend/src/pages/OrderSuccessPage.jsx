// src/pages/OrderSuccessPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function OrderSuccessPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box 
            sx={{ 
                minHeight: '80vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                p: 2
            }}
        >
            <Paper 
                elevation={6} 
                sx={{ 
                    p: 5, 
                    borderRadius: 4, 
                    maxWidth: 500, 
                    width: '100%', 
                    textAlign: 'center',
                    animation: 'fadeIn 0.5s ease-in-out',
                    '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                }}
            >
                <CheckCircleIcon 
                    sx={{ 
                        fontSize: 80, 
                        color: theme.palette.success.main, 
                        mb: 2,
                        filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'
                    }} 
                />
                
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: theme.palette.success.dark }}>
                    ĐẶT HÀNG THÀNH CÔNG!
                </Typography>

                <Box sx={{ my: 3, bgcolor: '#e8f5e9', p: 2, borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight="medium">
                        Phương thức: Thanh toán khi nhận hàng (COD)
                    </Typography>
                </Box>

                <Typography color="text.secondary" paragraph>
                    Cảm ơn bạn đã đặt hàng. <br/>
                    Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất.
                </Typography>
                
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => window.location.href = '/'} // Dùng reload để đảm bảo mọi state sạch sẽ
                    sx={{ 
                        mt: 2, 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: 50,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    Tiếp tục mua sắm
                </Button>
            </Paper>
        </Box>
    );
}

export default OrderSuccessPage;