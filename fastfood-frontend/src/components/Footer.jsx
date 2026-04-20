// src/components/Footer.jsx
import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Stack, Tooltip } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                background: 'linear-gradient(135deg, #1F2937 0%, #0F172A 100%)', // Gradient tối sang trọng
                color: '#F9FAFB',
                py: { xs: 6, md: 8 }, 
                mt: 10, 
                position: 'relative',
                overflow: 'hidden',
                borderTop: '4px solid #A62828', // Đường viền đỏ phía trên tạo điểm nhấn thương hiệu
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', // Pattern mờ tạo chiều sâu
                    opacity: 0.05,
                    pointerEvents: 'none',
                },
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={5}>
                    
                    {/* CỘT 1: THƯƠNG HIỆU */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 800, mb: 2, color: '#FFFFFF', 
                                letterSpacing: 2, fontFamily: '"Playfair Display", serif' 
                            }}
                        >
                            TASTY<span style={{ color: '#A62828' }}>.</span>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#D1D5DB', lineHeight: 1.8, mb: 3 }}>
                            Mang đến những bữa ăn ngon miệng từ nguyên liệu tươi sạch. Không gian hoàn hảo cho những tín đồ ẩm thực thực thụ.
                        </Typography>
                    </Grid>

                    {/* CỘT 2: KHÁM PHÁ (LINKS) */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" sx={{ mb: 3, color: '#FFFFFF', fontWeight: 600 }}>
                            Khám phá
                        </Typography>
                        <Stack spacing={2}>
                            {['Thực đơn', 'Khuyến mãi', 'Về chúng tôi', 'Tuyển dụng'].map((text, index) => (
                                <Link 
                                    key={index} href="#" color="inherit" underline="none"
                                    sx={{ 
                                        color: '#9CA3AF', transition: 'all 0.3s ease', display: 'inline-block', width: 'fit-content',
                                        '&:hover': { color: '#F87171', transform: 'translateX(8px)' } // Hiệu ứng trượt và đổi màu đỏ nhạt
                                    }}
                                >
                                    {text}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    {/* CỘT 3: LIÊN HỆ & MẠNG XÃ HỘI */}
                    <Grid item xs={12} sm={6} md={3.5}>
                        <Typography variant="h6" sx={{ mb: 3, color: '#FFFFFF', fontWeight: 600 }}>
                            Liên hệ
                        </Typography>
                        <Stack spacing={2.5} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <LocationOnIcon sx={{ mr: 2, color: '#F87171', mt: 0.3 }} />
                                <Typography variant="body2" sx={{ color: '#D1D5DB', lineHeight: 1.6 }}>
                                    123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneInTalkIcon sx={{ mr: 2, color: '#F87171' }} />
                                <Typography variant="body2" sx={{ color: '#D1D5DB' }}>(+84) 521 012 949</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ mr: 2, color: '#F87171' }} />
                                <Typography variant="body2" sx={{ color: '#D1D5DB' }}>contact@tastyfood.com</Typography>
                            </Box>
                        </Stack>

                        {/* Mạng xã hội */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Facebook" arrow>
                                <IconButton href="#" target="_blank" sx={{ color: '#D1D5DB', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#ffffff', bgcolor: '#1877F2', transform: 'translateY(-3px)' }, transition: 'all 0.3s' }}>
                                    <FacebookIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Instagram" arrow>
                                <IconButton href="#" target="_blank" sx={{ color: '#D1D5DB', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#ffffff', bgcolor: '#E4405F', transform: 'translateY(-3px)' }, transition: 'all 0.3s' }}>
                                    <InstagramIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Twitter" arrow>
                                <IconButton href="#" target="_blank" sx={{ color: '#D1D5DB', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#ffffff', bgcolor: '#1DA1F2', transform: 'translateY(-3px)' }, transition: 'all 0.3s' }}>
                                    <TwitterIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>

                    {/* CỘT 4: BẢN ĐỒ (MAP) */}
                    <Grid item xs={12} sm={6} md={3.5}>
                        <Typography variant="h6" sx={{ mb: 3, color: '#FFFFFF', fontWeight: 600 }}>
                            Vị trí của chúng tôi
                        </Typography>
                        <Box 
                            sx={{ 
                                width: '100%', 
                                height: '200px', 
                                borderRadius: 3, 
                                overflow: 'hidden',
                                border: '2px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#A62828',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                                }
                            }}
                        >
                            {/* BẠN THAY ĐỔI LINK TRONG THUỘC TÍNH `src` CỦA THẺ iframe NÀY NHA */}
                           <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m24!1m12!1m3!1d3723.4073029793417!2d105.71120432530181!3d21.05638853059983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m9!3e6!4m3!3m2!1d21.0563528!2d105.7138761!4m3!3m2!1d21.0563553!2d105.71370689999999!5e0!3m2!1svi!2s!4v1776619055483!5m2!1svi!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map"
                            />
                        </Box>
                    </Grid>

                </Grid>

                {/* COPYRIGHT TẠI ĐÁY */}
                <Box sx={{ textAlign: 'center', mt: 8, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', letterSpacing: 0.5 }}>
                        &copy; {new Date().getFullYear()} TASTY Foods. Đã đăng ký bản quyền.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Footer;