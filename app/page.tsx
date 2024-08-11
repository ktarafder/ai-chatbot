'use client';

import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Crescent Cloud Log support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    (messagesEndRef.current as HTMLElement | null)?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
    if (isLoading) return; // Prevent multiple simultaneous requests

    setIsLoading(true);
    const newMessage = { role: 'user', content: message };

    try {
      // Update messages state before sending to backend
      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage,
        { role: 'assistant', content: '...' },  // Placeholder for the assistant's response
      ]);

      const response = await fetch('/api/claude-bedrock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.content }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errorMessage}`);
      }

      const data = await response.json();

      // Update the assistant's message with the actual response
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: 'assistant',
          content: data.response || "No response received.",
        };
        return updatedMessages;
      });

    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
      setMessage('');
      scrollToBottom();
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#121212" // Dark background for the entire page
    >
      {/* Main Chat Box */}
      <Box
        width="500px"
        height="750px"
        bgcolor="linear-gradient(145deg, #1e1e1e, #2a2a2a)" // Gradient background for a techy feel
        boxShadow="0px 10px 30px rgba(0, 0, 0, 0.5)" // Deep shadow for a floating effect
        borderRadius={12} // Rounded corners for a sleek look
        border="2px solid #64b5f6" // Light blue outline
        overflow="hidden"
        display="flex"
        flexDirection="column"
        position="relative"
      >
        {/* Header with Logo */}
        <Box
          width="100%"
          height="70px"
          bgcolor="linear-gradient(145deg, #0d47a1, #1976d2)" // Gradient for the header
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          borderBottom="1px solid #0d47a1" // Subtle border at the bottom
        >
          <Typography variant="h6" color="#ffffff" fontWeight="bold">
            Crescent Cloud Log
          </Typography>
          <Box
            position="absolute"
            top="20%"
            left="16px"
            transform="translateY(-50%)"
            width="50px"  // Increased width
            height="50px" // Increased height
            bgcolor="rgba(255, 255, 255, 0.1)"
            borderRadius="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.3)"
          >
            <img src="/crescentcloudlogo.png" alt="Logo" style={{ width: "100px" }} /> {/* Adjusted size */}
          </Box>
        </Box>

        {/* Messages Container */}
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          p={2}
          overflow="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '0.4em' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#1976d2',
              borderRadius: '10px',
            },
          }} // Styled scrollbar
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'rgba(255, 255, 255, 0.1)' // Transparent white for assistant messages
                    : '#1976d2' // Blue for user messages
                }
                color={message.role === 'assistant' ? 'white' : 'white'}
                borderRadius={12}
                p={2}
                maxWidth="75%"
                boxShadow="0px 2px 12px rgba(0, 0, 0, 0.2)"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        {/* Input Area */}
        <Box
          display="flex"
          alignItems="center"
          p={2}
          bgcolor="#1e1e1e"
          borderTop="1px solid #0d47a1"
        >
          <TextField
            placeholder="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                bgcolor: '#2a2a2a',
                color: 'white',
              },
              '& .MuiInputBase-input': {
                padding: '10px 12px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2196f3',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#64b5f6',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              marginLeft: '8px',
              borderRadius: '20px',
              height: '40px',
              minWidth: '40px',
              bgcolor: '#0d47a1',
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
