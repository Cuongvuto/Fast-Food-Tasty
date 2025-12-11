import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, CircularProgress, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel'; // Icon lỗi đẹp hơn
import apiClient from'../API/axiosConfig';

function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const theme = useTheme();

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const orderId = searchParams.get('vnp_TxnRef');

        if (responseCode === '00') {
            setStatus('success');
            
            // 1. ĐẶT CỜ HIỆU ĐỂ CART CONTEXT TỰ XÓA GIỎ HÀNG
            localStorage.setItem('PAYMENT_SUCCESS', 'true');
            
            // 2. GỌI API CẬP NHẬT DATABASE (Chỉ gọi 1 lần nhờ SessionStorage check)
            const hasUpdated = sessionStorage.getItem(`paid_${orderId}`);
            if (orderId && !hasUpdated) {
                apiClient.put(`/orders/${orderId}/pay`)
                    .then(() => {
                        console.log("DB Updated: Paid");
                        sessionStorage.setItem(`paid_${orderId}`, 'true');
                    })
                    .catch(err => console.error("Error updating order:", err));
            }
        } else {
            setStatus('error');
        }
    }, [searchParams]);

    // Hàm về trang chủ (Reload để kích hoạt xóa giỏ hàng trong Context)
    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f5f5f5', // Nền xám nhẹ cho nổi bật hộp thông báo
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
                {status === 'loading' && (
                    <Box sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Đang xử lý kết quả...</Typography>
                    </Box>
                )}
                
                {status === 'success' && (
                    <Box>
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
                            <Typography variant="subtitle1" fontWeight="bold">
                                Mã đơn hàng: #{searchParams.get('vnp_TxnRef')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                (Đã thanh toán qua VNPay)
                            </Typography>
                        </Box>

                        <Typography color="text.secondary" paragraph>
                            Cảm ơn bạn đã tin tưởng FastFood. <br/>
                            Chúng tôi sẽ tiến hành giao hàng ngay lập tức.
                        </Typography>
                        
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={handleGoHome}
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
                            Hoàn tất & Về trang chủ
                        </Button>
                    </Box>
                )}

                {status === 'error' && (
                    <Box>
                        <CancelIcon 
                            sx={{ 
                                fontSize: 80, 
                                color: theme.palette.error.main, 
                                mb: 2 
                            }} 
                        />
                        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: theme.palette.error.dark }}>
                            THANH TOÁN THẤT BẠI
                        </Typography>

                        <Box sx={{ my: 3, bgcolor: '#ffebee', p: 2, borderRadius: 2 }}>
                             <Typography variant="body1" fontWeight="medium">
                                Giao dịch không thành công
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Mã lỗi: {searchParams.get('vnp_ResponseCode')}
                            </Typography>
                        </Box>

                        <Typography color="text.secondary" paragraph>
                            Có vẻ như bạn đã hủy giao dịch hoặc thẻ không đủ số dư.
                            Vui lòng thử lại nhé!
                        </Typography>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                onClick={() => window.location.href = '/checkout'}
                            >
                                Thử lại ngay
                            </Button>
                            <Button 
                                variant="text" 
                                color="inherit" 
                                onClick={handleGoHome}
                            >
                                Về trang chủ
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default PaymentResultPage;