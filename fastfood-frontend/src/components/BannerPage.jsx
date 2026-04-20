import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Mảng chứa đường dẫn ảnh từ thư mục public.

const images = [
    '/bannerPage1.jpg',
    '/bannerPage2.jpg',
    '/bannerPage3.jpg'
];

function BannerPage({ title }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Xử lý logic tự động chuyển ảnh sau mỗi 4 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000); // 4000ms = 4 giây

        return () => clearInterval(timer); // Dọn dẹp timer khi component unmount
    }, []);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                // Responsive chiều cao: Mobile 150px, PC 250px
                height: { xs: '150px', md: '250px' }, 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e0e0e0', // Màu nền dự phòng khi ảnh chưa load xong
            }}
        >
            {/* Lặp qua các ảnh để tạo hiệu ứng Fade */}
            {images.map((img, index) => (
                <Box
                    key={index}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        // Logic hiệu ứng chuyển cảnh: Chỉ hiện ảnh có index hiện tại
                        opacity: index === currentIndex ? 1 : 0,
                        transition: 'opacity 1s ease-in-out', // Chuyển mượt trong 1 giây
                        zIndex: 1
                    }}
                />
            ))}

            {/* (Tùy chọn) Phủ một lớp màu đen mờ để làm nổi bật chữ nếu bạn muốn chèn tiêu đề */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Đổi 0.4 thành 0 nếu không muốn lớp mờ này
                    zIndex: 2
                }}
            />

            {/* Hiển thị tiêu đề trang ở giữa Banner */}
            {title && (
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="white"
                    sx={{ 
                        zIndex: 3, 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.6)', // Đổ bóng chữ cho dễ đọc
                        fontSize: { xs: '2rem', md: '3rem' } // Chữ nhỏ lại trên điện thoại
                    }}
                >
                    {title}
                </Typography>
            )}
        </Box>
    );
}

export default BannerPage;