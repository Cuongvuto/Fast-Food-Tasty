// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../API/axiosConfig';
import { useCart } from './CartContext'; // Đảm bảo import useCart nếu cần dùng

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // State lưu thông tin user (id, full_name, email, role)
    const [user, setUser] = useState(null);
    // State lưu token, lấy từ localStorage khi khởi tạo
    const [token, setToken] = useState(localStorage.getItem('token'));
    // State xác định đã đăng nhập hay chưa (dựa vào sự tồn tại của token ban đầu)
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);
    // State xác định có phải admin hay không (sẽ được cập nhật sau khi fetch user)
    const [isAdmin, setIsAdmin] = useState(false);
    // State loading để biết khi nào đang fetch thông tin user lúc tải trang
    const [loading, setLoading] = useState(true);
    // Lấy hàm clearCart từ CartContext để dùng khi logout
    const { clearCart } = useCart();

    // useEffect này chạy khi component mount lần đầu hoặc khi 'token' thay đổi
    useEffect(() => {
        // Hàm bất đồng bộ để fetch thông tin user dựa vào token
        const fetchUserOnLoad = async (currentToken) => {
            try {
                // Đặt token vào header cho request /auth/me
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
                // Gọi API backend để lấy thông tin user hiện tại
                const response = await apiClient.get('/auth/me');

                // Lấy dữ liệu user từ response
                const userData = response.data.data;
                setUser(userData); // Cập nhật state 'user'
                setIsLoggedIn(true); // Xác nhận đã đăng nhập

                // Xác định và cập nhật state 'isAdmin' dựa vào role từ backend
                const userIsAdmin = userData.role === 'admin';
                setIsAdmin(userIsAdmin);
                // Đồng bộ trạng thái admin vào localStorage
                localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');

            } catch (error) {
                // Nếu gọi API /auth/me thất bại (token hết hạn, không hợp lệ,...)
                console.error("Lỗi khi fetch user bằng token:", error);
                // Gọi hàm logout để dọn dẹp token, state và localStorage
                logout();
            } finally {
                // Dù thành công hay thất bại, đánh dấu là đã loading xong
                setLoading(false);
            }
        };

        // Nếu có token trong localStorage (khi tải lại trang hoặc vừa login)
        if (token) {
            // Gọi hàm fetchUserOnLoad để lấy thông tin user
            fetchUserOnLoad(token);
        } else {
            // Nếu không có token, không cần fetch, đánh dấu loading xong
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUser(null);
            setLoading(false);
        }
        // Dependency array là [token], nghĩa là effect này chỉ chạy lại khi giá trị 'token' thay đổi (login/logout)
    }, [token]);

    // Hàm xử lý đăng nhập
    const login = async (email, password) => {
        try {
            // Gọi API /auth/login
            const response = await apiClient.post('/auth/login', { email, password });
            // Lấy token và dữ liệu user từ response backend
            const { token: userToken, data: userData } = response.data;

            // Lưu token vào localStorage
            localStorage.setItem('token', userToken);
            // Xác định user có phải admin không
            const userIsAdmin = userData?.role === 'admin';
            // Lưu trạng thái admin vào localStorage
            localStorage.setItem('isAdmin', userIsAdmin ? 'true' : 'false');

            // Cập nhật các state trong context
            setToken(userToken); // Việc setToken sẽ trigger useEffect ở trên chạy lại
            setUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(userIsAdmin);

            // Đặt token vào header mặc định cho các request API sau này
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
            return response; // Trả về response gốc để LoginPage có thể xử lý (ví dụ: chuyển hướng)
        } catch (error) {
            // Nếu đăng nhập thất bại, dọn dẹp state và localStorage
            logout(); // Hàm logout đã xử lý việc xóa token và các state
            throw error; // Ném lỗi ra ngoài để LoginPage có thể bắt và hiển thị
        }
    };

    // Hàm xử lý đăng ký
    const register = async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            const { token: userToken, data } = response.data;
            localStorage.setItem('token', userToken);
            localStorage.setItem('isAdmin', 'false'); // Người dùng mới luôn là 'user'
            setToken(userToken);
            setUser(data);
            setIsLoggedIn(true);
            setIsAdmin(false);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
            return response;
        } catch (error) {
             console.error("Lỗi đăng ký:", error);
             throw error;
        }
    };

    // Hàm xử lý đăng xuất
    const logout = () => {
        // Xóa token và trạng thái admin khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        // Reset các state về trạng thái ban đầu
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        // Xóa token khỏi header mặc định của apiClient
        delete apiClient.defaults.headers.common['Authorization'];
        // Xóa giỏ hàng
        clearCart();
        // Đảm bảo dừng loading (nếu có)
        setLoading(false);
    };

   
    const value = {
        user,       
        token,      
        isLoggedIn, 
        isAdmin,    
        loading,    
        login,      
        register,  
        logout,    
    };

    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};