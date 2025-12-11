// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from'../API/axiosConfig';
import {
  Container, Typography, Grid, CircularProgress, Alert, Box,
  useTheme, Button, Pagination, Autocomplete, TextField
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import SearchIcon from '@mui/icons-material/Search';

// Helper để lấy query params từ URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MenuPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const query = useQuery();

  // --- State cho Dữ liệu Sản phẩm ---
  const searchTerm = query.get('search'); // Lấy từ URL
  const currentPage = parseInt(query.get('page')) || 1;
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [loadingProducts, setLoadingProducts] = useState(true); // Loading danh sách món ăn
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('Thực Đơn');

  // --- State cho Thanh Tìm Kiếm (Autocomplete) ---
  const [searchInputValue, setSearchInputValue] = useState(searchTerm || ''); // Giá trị đang gõ
  const [suggestOptions, setSuggestOptions] = useState([]); // Danh sách gợi ý
  const [loadingSuggest, setLoadingSuggest] = useState(false); // Loading gợi ý

  const primaryColor = '#A62828';

  // 1. Fetch danh sách sản phẩm chính (khi URL thay đổi)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      let url = `/products?page=${currentPage}&limit=9`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
        setTitle(`Kết quả tìm kiếm: "${searchTerm}"`);
        setSearchInputValue(searchTerm); // Đồng bộ ô input với URL
      } else {
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
  }, [searchTerm, currentPage]);

  // 2. Fetch gợi ý tìm kiếm (Debounce khi gõ)
  useEffect(() => {
    if (!searchInputValue.trim()) {
        setSuggestOptions([]);
        return;
    }
    
    // Nếu giá trị gõ trùng với URL rồi thì không cần gợi ý lại (tránh loop)
    if (searchInputValue === searchTerm) return;

    setLoadingSuggest(true);
    const delayDebounceFn = setTimeout(async () => {
        try {
            const response = await apiClient.get(`/products?search=${searchInputValue.trim()}&limit=5`); // Lấy 5 gợi ý
            setSuggestOptions(response.data.data || []);
        } catch (error) {
            console.error("Lỗi gợi ý:", error);
        } finally {
            setLoadingSuggest(false);
        }
    }, 300); // Chờ 300ms sau khi ngừng gõ

    return () => clearTimeout(delayDebounceFn);
  }, [searchInputValue]);


  // Xử lý khi chọn trang mới
  const handlePageChange = (event, value) => {
    navigate(`/menu?page=${value}${searchTerm ? `&search=${searchTerm}` : ''}`);
    window.scrollTo(0, 0);
  };

  // Xử lý khi người dùng Submit tìm kiếm (Chọn gợi ý hoặc Enter)
  const handleSearchSubmit = (value) => {
      if (value && value.trim()) {
          navigate(`/menu?search=${value.trim()}`);
      } else {
          navigate('/menu'); // Nếu xóa trắng thì về menu gốc
      }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      
      {/* --- PHẦN HEADER & TÌM KIẾM --- */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700, 
                color: '#2C2C2C',
                mb: 1
            }}
        >
            {title}
        </Typography>
        <Typography 
            variant="body1" 
            sx={{ 
                fontFamily: '"Open Sans", sans-serif',
                color: 'text.secondary',
                mb: 4
            }}
        >
            Khám phá hương vị tuyệt hảo từ những nguyên liệu tươi ngon nhất.
        </Typography>

        {/* Thanh Tìm Kiếm Autocomplete */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Autocomplete
                freeSolo
                options={suggestOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                filterOptions={(x) => x} // Tắt bộ lọc client vì đã lọc server
                loading={loadingSuggest}
                
                // Giá trị hiển thị trong ô
                inputValue={searchInputValue}
                onInputChange={(event, newInputValue) => {
                    setSearchInputValue(newInputValue);
                }}

                // Khi người dùng chọn
                onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        handleSearchSubmit(newValue);
                    } else if (newValue && newValue.name) {
                        handleSearchSubmit(newValue.name);
                    }
                }}

                // Render ô nhập liệu
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Bạn muốn ăn gì hôm nay?"
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1, ml: 1 }} />
                            ),
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
                                bgcolor: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Bóng nhẹ cho ô tìm kiếm
                                '& fieldset': { borderColor: 'transparent' },
                                '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                                '&.Mui-focused fieldset': { borderColor: primaryColor },
                            }
                        }}
                    />
                )}
                // Render từng dòng gợi ý (Tùy chọn để đẹp hơn)
                renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                        <Grid container alignItems="center">
                            <Grid item sx={{ display: 'flex', width: 44 }}>
                                <img
                                    src={option.image_url}
                                    alt={option.name}
                                    style={{ width: 35, height: 35, objectFit: 'cover', borderRadius: 4 }}
                                />
                            </Grid>
                            <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                                <Box component="span" sx={{ fontWeight: 'bold', display: 'block' }}>
                                    {option.name}
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {parseInt(option.price).toLocaleString('vi-VN')}đ
                                </Typography>
                            </Grid>
                        </Grid>
                    </li>
                )}
            />
        </Box>
      </Box>

      {/* --- DANH SÁCH SẢN PHẨM --- */}
      {loadingProducts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8, minHeight: 400 }}>
            <CircularProgress sx={{ color: primaryColor }} size={60} />
        </Box>
      ) : error ? (
        <Container sx={{ my: 8 }}>
            <Alert severity="error" sx={{ textAlign: 'center' }}>{error}</Alert>
        </Container>
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
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.1rem',
                        '&.Mui-selected': {
                            bgcolor: primaryColor,
                            color: 'white',
                            '&:hover': { bgcolor: '#801f1f' }
                        }
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
            Không tìm thấy món nào tên "{searchTerm}".
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
                setSearchInputValue(''); // Xóa ô tìm kiếm
                handleSearchSubmit(''); // Về trang gốc
            }}
            sx={{
              color: primaryColor,
              borderColor: primaryColor,
              fontFamily: '"Open Sans", sans-serif',
              '&:hover': { borderColor: '#801f1f', bgcolor: 'rgba(166, 40, 40, 0.04)' }
            }}
          >
            Xem tất cả thực đơn
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default MenuPage;