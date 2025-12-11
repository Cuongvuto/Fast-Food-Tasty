// src/components/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography, Avatar, Fab, CircularProgress } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // Icon Robot
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../api/axiosConfig';

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Tôi là trợ lý AI của Tasty Food. Bạn muốn ăn gì hôm nay? 🍔", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInput('');
        setLoading(true);

        try {
            // Gọi API backend
            const response = await apiClient.post('/chat', { message: userMessage });
            setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Xin lỗi, tôi đang gặp chút sự cố kết nối.", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
            {/* Cửa sổ Chat */}
            {isOpen && (
                <Paper 
                    elevation={6}
                    sx={{
                        width: 350,
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
                            <Avatar sx={{ bgcolor: 'white', color: '#A62828', mr: 1 }}>
                                <SmartToyIcon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold">Trợ lý AI</Typography>
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
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {msg.text}
                                </Paper>
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Paper sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
                                    <CircularProgress size={15} color="inherit" /> Đang soạn tin...
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Ô nhập liệu */}
                    <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Hỏi món ăn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            sx={{ mr: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <IconButton 
                            color="primary" 
                            onClick={handleSend}
                            disabled={loading}
                            sx={{ bgcolor: '#A62828', color: 'white', '&:hover': { bgcolor: '#8a1c1c' } }}
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
                    width: 60, height: 60
                }}
            >
                {isOpen ? <CloseIcon /> : <SmartToyIcon fontSize="large" />}
            </Fab>
        </Box>
    );
}

export default ChatWidget;