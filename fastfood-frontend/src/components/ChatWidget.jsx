// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Avatar, Fab, CircularProgress, useTheme } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../API/axiosConfig';

function ChatWidget() {
    const theme = useTheme(); // Dùng theme để lấy màu chuẩn
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Tôi là trợ lý AI của Tasty Food. Bạn muốn ăn gì hôm nay? 🍔", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // Ref để auto focus

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]); // Scroll khi có tin mới hoặc khi mở box

    // Tự động focus vào ô nhập liệu khi mở box
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return; // Chặn nếu đang loading

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInput('');
        setLoading(true);

        try {
            const response = await apiClient.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, server đang bận. Vui lòng thử lại sau ít phút!", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: { xs: 20, md: 30 }, right: { xs: 20, md: 30 }, zIndex: 1000 }}>
            {/* Cửa sổ Chat */}
            {isOpen && (
                <Paper
                    elevation={6}
                    sx={{
                        width: { xs: '300px', sm: '350px' }, // Responsive: Nhỏ hơn trên mobile
                        height: 450,
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid #eee'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ bgcolor: '#A62828', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: 'white', color: '#A62828', mr: 1, width: 32, height: 32 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold">Trợ lý Tasty</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Nội dung Chat */}
                    <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f9f9f9' }}>
                        {messages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    mb: 1.5
                                }}
                            >
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        maxWidth: '80%',
                                        bgcolor: msg.sender === 'user' ? '#A62828' : 'white',
                                        color: msg.sender === 'user' ? 'white' : 'black',
                                        borderRadius: 2,
                                        fontSize: '0.95rem',
                                        whiteSpace: 'pre-line', // Quan trọng: Để hiển thị xuống dòng đúng
                                        wordBreak: 'break-word', // Tránh text dài bị tràn
                                        boxShadow: 1
                                    }}
                                >
                                    {msg.text}
                                </Paper>
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                                <Paper sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} /> 
                                    <Typography variant="caption">Đang nhập...</Typography>
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Ô nhập liệu */}
                    <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex', bgcolor: 'white' }}>
                        <TextField
                            inputRef={inputRef} // Gắn ref vào đây
                            fullWidth
                            size="small"
                            placeholder="Hỏi món ăn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            // Sửa sự kiện nhấn phím
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !loading) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={loading} // Disable khi đang gửi
                            sx={{ mr: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={loading || !input.trim()} // Disable nút gửi khi rỗng hoặc loading
                            sx={{ 
                                bgcolor: '#A62828', 
                                color: 'white', 
                                '&:hover': { bgcolor: '#8a1c1c' },
                                '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } 
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            )}

            {/* Nút tròn mở Chat */}
            <Fab
                color="primary"
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    bgcolor: '#A62828',
                    '&:hover': { bgcolor: '#8a1c1c' },
                    width: 60, height: 60,
                    boxShadow: 4
                }}
            >
                {isOpen ? <CloseIcon /> : <SmartToyIcon fontSize="large" />}
            </Fab>
        </Box>
    );
}

export default ChatWidget;