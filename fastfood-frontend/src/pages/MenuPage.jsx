// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../API/axiosConfig';
import {
  Container, Typography, Grid, CircularProgress, Alert, Box,
  useTheme, Button, Pagination, Autocomplete, TextField, Stack
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import SearchIcon from '@mui/icons-material/Search';
import BannerPage from '../components/BannerPage'; // Import Banner vào

// --- DATA DANH MỤC ---
const CATEGORIES = [
  { name: 'TẤT CẢ', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', slug: 'all', description: 'Tất cả món ăn' }, 
  { name: 'BURGER', image: '/category_burger.jpg', slug: 'burger', description: 'Juicy burgers for every craving' }, 
  { name: 'PIZZA', image: '/category_pizza.jpg', slug: 'pizza', description: 'Cheesy pizzas with fresh toppings' }, 
  { name: 'GÀ RÁN', image: '/category_chicken.jpg', slug: 'ga-ran', description: 'Crispy fried chicken delights' }, 
  { name: 'SALADS', image: '/category_salad.jpg', slug: 'salads', description: 'Fresh and healthy salads' }, 
  { name: 'KHOAI TÂY & BÁNH', image: '/category_sides_dessert.jpg', slug: 'khoai-tay-va-banh', description: 'Sides and sweet treats' }, 
  { name: 'DRINKS', image: '/category_drinks.jpg', slug: 'drinks', description: 'Refreshing drinks and beverages' }, 
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MenuPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const query = useQuery();

  const searchTerm = query.get('search'); 
  const categorySlug = query.get('category') || 'all'; 
  const currentPage = parseInt(query.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('Thực Đơn');

  const [searchInputValue, setSearchInputValue] = useState(searchTerm || ''); 
  const [suggestOptions, setSuggestOptions] = useState([]); 
  const [loadingSuggest, setLoadingSuggest] = useState(false); 

  const primaryColor = '#A62828';

  // 1. Fetch danh sách sản phẩm chính
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      let url = `/products?page=${currentPage}&limit=9`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
        setTitle(`Kết quả tìm kiếm: "${searchTerm}"`);
        setSearchInputValue(searchTerm); 
      } 
      else if (categorySlug !== 'all') {
        url += `&category=${categorySlug}`;
        const activeCat = CATEGORIES.find(c => c.slug === categorySlug);
        setTitle(activeCat ? activeCat.name : 'Thực Đơn');
      } 
      else {
        setTitle('Thực Đơn Thượng Hạng');
      }

      try {
        const response = await apiClient.get(url);
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError('Không thể tải thực đơn.');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [searchTerm, categorySlug, currentPage]); 

  // 2. Fetch gợi ý tìm kiếm
  useEffect(() => {
    if (!searchInputValue.trim()) {
        setSuggestOptions([]);
        return;
    }
    if (searchInputValue === searchTerm) return;

    setLoadingSuggest(true);
    const delayDebounceFn = setTimeout(async () => {
        try {
            const response = await apiClient.get(`/products?search=${searchInputValue.trim()}&limit=5`);
            setSuggestOptions(response.data.data || []);
        } catch (error) {
            console.error("Lỗi gợi ý:", error);
        } finally {
            setLoadingSuggest(false);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInputValue]);

  const handlePageChange = (event, value) => {
    let newUrl = `/menu?page=${value}`;
    if (searchTerm) newUrl += `&search=${searchTerm}`;
    if (categorySlug !== 'all') newUrl += `&category=${categorySlug}`;
    navigate(newUrl);
    // Cuộn lên phần danh mục thay vì cuộn lên tít đầu trang
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleSearchSubmit = (value) => {
      if (value && value.trim()) {
          navigate(`/menu?search=${value.trim()}`); 
      } else {
          navigate('/menu'); 
      }
  };

  const handleCategoryClick = (slug) => {
    if (slug === 'all') {
      navigate('/menu'); 
    } else {
      navigate(`/menu?category=${slug}`); 
    }
    setSearchInputValue(''); 
  };

  return (
    <Box sx={{ width: '100%', pb: 8 }}>
      
      {/* --- BANNER TRÀN VIỀN CHỨA THANH TÌM KIẾM --- */}
      <BannerPage 
        title={title} 
        subtitle={!searchTerm && categorySlug === 'all' ? "Khám phá hương vị tuyệt hảo từ những nguyên liệu tươi ngon nhất." : ""}
      >
        <Autocomplete
            freeSolo
            options={suggestOptions}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            filterOptions={(x) => x} 
            loading={loadingSuggest}
            inputValue={searchInputValue}
            onInputChange={(e, newInputValue) => setSearchInputValue(newInputValue)}
            onChange={(e, newValue) => {
                if (typeof newValue === 'string') handleSearchSubmit(newValue);
                else if (newValue && newValue.name) handleSearchSubmit(newValue.name);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Bạn muốn ăn gì hôm nay?"
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />,
                        endAdornment: (
                            <React.Fragment>
                                {loadingSuggest ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '50px', 
                            bgcolor: 'white', // Nền trắng để nổi bật trên nền ảnh tối
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: 'transparent' },
                            '&.Mui-focused fieldset': { borderColor: primaryColor, borderWidth: '2px' },
                        }
                    }}
                />
            )}
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                    <Grid container alignItems="center">
                        <Grid item sx={{ display: 'flex', width: 44 }}>
                            <img src={option.image_url} alt={option.name} style={{ width: 35, height: 35, objectFit: 'cover', borderRadius: 4 }} />
                        </Grid>
                        <Grid item sx={{ width: 'calc(100% - 44px)' }}>
                            <Box component="span" sx={{ fontWeight: 'bold', display: 'block' }}>{option.name}</Box>
                            <Typography variant="body2" color="text.secondary">
                                {parseInt(option.price).toLocaleString('vi-VN')}đ
                            </Typography>
                        </Grid>
                    </Grid>
                </li>
            )}
        />
      </BannerPage>

      {/* --- NỘI DUNG BÊN DƯỚI (NẰM TRONG CONTAINER ĐỂ CĂN LỀ) --- */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        
        {/* --- THANH CHỌN DANH MỤC (CATEGORY SLIDER) --- */}
        <Box sx={{ width: '100%', overflowX: 'auto', pb: 2, mb: 4, '::-webkit-scrollbar': { display: 'none' } }}>
          <Stack direction="row" spacing={3} justifyContent="center" sx={{ minWidth: 'max-content' }}>
            {CATEGORIES.map((cat) => {
              const isActive = categorySlug === cat.slug;
              return (
                <Box
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: 100, 
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-3px)' }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '16px', 
                      backgroundColor: isActive ? '#FFE6E6' : '#F5F5F5', 
                      border: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      mb: 1,
                      boxShadow: isActive ? `0 4px 10px rgba(166, 40, 40, 0.2)` : 'none',
                    }}
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png'; }}
                    />
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: isActive ? 700 : 500, 
                      color: isActive ? primaryColor : '#4A4A4A',
                      textAlign: 'center',
                      fontSize: '0.85rem'
                    }}
                  >
                    {cat.name}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        </Box>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        {loadingProducts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8, minHeight: 400 }}>
              <CircularProgress sx={{ color: primaryColor }} size={60} />
          </Box>
        ) : error ? (
          <Container sx={{ my: 8 }}><Alert severity="error" sx={{ textAlign: 'center' }}>{error}</Alert></Container>
        ) : products.length > 0 ? (
          <>
            <Grid container spacing={6}>
              {products.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="large"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            fontFamily: '"Playfair Display", serif', fontSize: '1.1rem',
                            '&.Mui-selected': { bgcolor: primaryColor, color: 'white', '&:hover': { bgcolor: '#801f1f' } }
                        }
                    }}
                  />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', mb: 3 }}>
              Không tìm thấy món ăn nào.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => handleCategoryClick('all')}
              sx={{
                color: primaryColor, borderColor: primaryColor,
                '&:hover': { borderColor: '#801f1f', bgcolor: 'rgba(166, 40, 40, 0.04)' }
              }}
            >
              Xem tất cả thực đơn
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default MenuPage;