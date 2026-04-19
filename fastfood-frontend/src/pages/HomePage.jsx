// src/pages/HomePage.jsx
import React from 'react';
import { Box } from '@mui/material';
import HeroSection from './homeSections/HeroSection';
import CategoriesSection from './homeSections/CategoriesSection';
import SuggestionsSection from './homeSections/SuggestionsSection';
import ComboSection from './homeSections/ComboSection';

function HomePage() {
    return (
        <Box 
            sx={{ 
                // Cấu hình nền màu xám cực nhạt để các thẻ sản phẩm (màu trắng) nổi bật lên
                bgcolor: '#f8f9fa', 
                minHeight: '100vh',
                pb: { xs: 6, md: 10 }, // Đệm dưới cùng để lướt mượt hơn, không bị dính chân trang
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Ngăn chặn lỗi cuộn ngang toàn trang gây vỡ layout
            }}
        >
            {/* Phần 1: Hero Section (Banner chính) */}
            <Box sx={{ bgcolor: '#fff' }}>
                <HeroSection />
            </Box>

            {/* Khối chứa các Section nội dung */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    // Sử dụng gap để tạo khoảng cách đều đặn giữa các Section
                    // (Bạn có thể tăng giảm số 4, 6, 8 này để khoảng cách các khối vừa mắt nhất)
                    gap: { xs: 4, sm: 6, md: 8 }, 
                    pt: { xs: 2, md: 4 }
                }}
            >
                {/* Phần 2: Các danh mục sản phẩm */}
                <CategoriesSection />

                {/* Phần 3: Combo Section */}
                <ComboSection />

                {/* Phần 4: Các sản phẩm được đề xuất */}
                <SuggestionsSection />
            </Box>
        </Box>
    );
}

export default HomePage;