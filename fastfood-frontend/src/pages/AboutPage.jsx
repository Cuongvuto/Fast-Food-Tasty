// src/pages/AboutPage.jsx
import React from 'react';
import { Container, Box, Typography, Grid, Paper, Button, useTheme, Card, CardContent, Avatar } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

function AboutPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    // Hiệu ứng fade-in mượt mà hơn
    const fadeIn = {
        animation: 'fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(30px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
        },
    };

    // Dữ liệu cho phần cam kết để code gọn hơn
    const commitments = [
        {
            title: 'Nguyên liệu tươi sạch',
            desc: 'Chúng tôi chỉ chọn lựa thực phẩm từ các nhà cung cấp uy tín, đảm bảo độ tươi ngon mỗi ngày.',
            icon: <FastfoodIcon fontSize="large" />,
            color: '#4CAF50' // Xanh lá
        },
        {
            title: 'Chất lượng hàng đầu',
            desc: 'Mọi món ăn đều được chế biến theo quy trình nghiêm ngặt, giữ trọn hương vị nguyên bản.',
            icon: <HighQualityIcon fontSize="large" />,
            color: '#FF9800' // Cam
        },
        {
            title: 'Phục vụ tận tâm',
            desc: 'Trải nghiệm của bạn là ưu tiên số 1. Chúng tôi luôn lắng nghe để phục vụ bạn tốt hơn.',
            icon: <RestaurantMenuIcon fontSize="large" />,
            color: '#E91E63' // Hồng
        }
    ];

    return (
        <Box sx={{ ...fadeIn, pb: 8, bgcolor: '#FAFAFA' }}>
            
            {/* === Phần Hero Banner (Lớn hơn, đậm chất điện ảnh hơn) === */}
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: 300, md: 450 },
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%), url("/category_burger.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: { md: 'fixed' }, // Hiệu ứng parallax nhẹ trên desktop
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    px: 3,
                }}
            >
                <Box sx={{ zIndex: 1, maxWidth: '800px' }}>
                    <Typography 
                        variant="h2" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 900, 
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            mb: 2,
                            textShadow: '2px 4px 10px rgba(0,0,0,0.8)' 
                        }}
                    >
                        Về <Box component="span" sx={{ color: theme.palette.primary.main }}>TASTY</Box>
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ fontWeight: 400, opacity: 0.9, textShadow: '1px 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        Hương vị đích thực - Phục vụ từ trái tim.
                    </Typography>
                </Box>
            </Box>

            <Container sx={{ mt: { xs: -5, md: -8 }, position: 'relative', zIndex: 2 }}>
                
                {/* === Phần Câu chuyện (Nâng ảnh lên đè vào banner một chút) === */}
                <Paper elevation={4} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, bgcolor: 'white' }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '1rem', letterSpacing: 2 }}>
                                Khởi nguồn
                            </Typography>
                            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 3, mt: 1 }}>
                                Câu chuyện của chúng tôi
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                Thương hiệu <strong>TASTY</strong> được thành lập vào năm 2025 với một sứ mệnh đơn giản: mang đến những món ăn nhanh không chỉ tiện lợi mà còn phải <strong>chất lượng</strong> và <strong>ngon miệng</strong>.
                                <br /><br />
                                Chúng tôi tin rằng đồ ăn nhanh không có nghĩa là đồ ăn cẩu thả. Từ chiếc burger bò Mỹ mọng nước đến từng sợi khoai tây chiên giòn rụm, tất cả đều được chuẩn bị từ những nguyên liệu tươi ngon nhất, bởi những đầu bếp đầy đam mê.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box 
                                sx={{ 
                                    borderRadius: 4, 
                                    overflow: 'hidden', 
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                    transform: 'rotate(2deg)', // Nghiêng nhẹ cho nghệ thuật
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { transform: 'rotate(0deg) scale(1.02)' }
                                }}
                            >
                                <img 
                                    src="/category_chicken.jpg" 
                                    alt="TASTY Chicken" 
                                    style={{ width: '100%', display: 'block', height: '100%', objectFit: 'cover' }} 
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* === Phần Cam kết (Dùng 3 cột bằng nhau với Card UI) === */}
                <Box sx={{ mt: { xs: 8, md: 12 }, mb: { xs: 8, md: 10 } }}>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
                        Cam kết của TASTY
                    </Typography>
                    <Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, maxWidth: 600, mx: 'auto' }}>
                        Ba giá trị cốt lõi làm nên sự khác biệt của chúng tôi trong từng bữa ăn của bạn.
                    </Typography>
                    
                    <Grid container spacing={4} justifyContent="center">
                        {commitments.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card 
                                    elevation={0}
                                    sx={{ 
                                        height: '100%',
                                        textAlign: 'center', 
                                        p: 3, 
                                        borderRadius: 4,
                                        border: '1px solid #E0E0E0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { 
                                            transform: 'translateY(-10px)', 
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                                            borderColor: 'transparent'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Avatar 
                                            sx={{ 
                                                width: 80, height: 80, 
                                                bgcolor: `${item.color}15`, // Màu nhạt làm nền
                                                color: item.color,
                                                mb: 3
                                            }}
                                        >
                                            {item.icon}
                                        </Avatar>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            {item.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* === Phần Kêu gọi hành động (Bọc trong một khối Banner nhỏ) === */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        textAlign: 'center', 
                        p: { xs: 5, md: 8 }, 
                        borderRadius: 6,
                        bgcolor: 'primary.main',
                        color: 'white',
                        backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                    }}
                >
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                        Sẵn sàng thưởng thức?
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 5, fontWeight: 400, opacity: 0.9 }}>
                        Đừng để chiếc bụng đói chờ thêm nữa. Khám phá menu đa dạng của chúng tôi ngay!
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => navigate('/menu')}
                        endIcon={<ArrowForwardIosIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 'bold',
                            borderRadius: 50, // Nút bo tròn hoàn toàn
                            py: 1.5,
                            px: 5,
                            fontSize: '1.1rem',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                            '&:hover': { 
                                bgcolor: '#f5f5f5',
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 25px rgba(0,0,0,0.3)',
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Xem Thực Đơn
                    </Button>
                </Paper>

            </Container>
        </Box>
    );
}

export default AboutPage;