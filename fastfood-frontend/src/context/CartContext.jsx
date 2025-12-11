// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'; // Nhớ import useEffect

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Hàm helper đọc dữ liệu
const getInitialCart = () => {
    try {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(getInitialCart);

    // --- THÊM ĐOẠN NÀY: TỰ ĐỘNG XÓA GIỎ KHI CÓ CỜ HIỆU ---
    useEffect(() => {
        // Kiểm tra xem vừa thanh toán xong không
        const isPaid = localStorage.getItem('PAYMENT_SUCCESS');
        
        if (isPaid === 'true') {
            console.log("--> PHÁT HIỆN THANH TOÁN THÀNH CÔNG: XÓA GIỎ HÀNG <--");
            
            // 1. Xóa State
            setCartItems([]);
            
            // 2. Xóa LocalStorage giỏ hàng
            localStorage.removeItem('cart');
            
            // 3. Xóa luôn cờ hiệu (để lần sau vào web không bị xóa nhầm)
            localStorage.removeItem('PAYMENT_SUCCESS');
        }
    }, []); // Chạy 1 lần duy nhất khi App/Context khởi động
    // -----------------------------------------------------

    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find((item) => item.id === product.id);
            let newItems;
            if (itemExists) {
                newItems = prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                newItems = [...prevItems, { ...product, quantity }];
            }
            localStorage.setItem('cart', JSON.stringify(newItems));
            return newItems;
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter((item) => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(newItems));
            return newItems;
        });
    };

    const clearCart = () => {
        localStorage.removeItem('cart');
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};