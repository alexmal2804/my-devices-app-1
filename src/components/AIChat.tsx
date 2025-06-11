import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { sendMessageToAI } from '../services/aiService';

interface AIChatProps {
  employee: any;
  device: any;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  action?: {
    type: string;
    payload: any;
  };
}

const AIChat: React.FC<AIChatProps> = ({ employee, device, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | {text: string, deviceInfo: string}>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Системный промпт
  const systemPrompt = `\nТы — AI-помощник по ИТ-оборудованию.\nИнформация о сотруднике: ${JSON.stringify(employee)}\nИнформация об оборудовании: ${JSON.stringify(device)}\nОтвечай только по данному оборудованию.\n`;

  useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, [onClose]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    setLoading(true);
    sendMessageToAI(systemPrompt, [], employee, device)
      .then((reply) => {
        setMessages([{ sender: 'ai', text: reply }]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendMessageToAI(input, newMessages, employee, device);
      // Проверка на спец. маркер обращения
      if (reply.startsWith('[TICKET]')) {
        const ticketText = reply.replace('[TICKET]', '').trim();
        setPendingAction({text: ticketText, deviceInfo: device?.name || device?.id || ''});
        setMessages([...newMessages, { sender: 'ai' as 'ai', text: ticketText }]);
      } else {
        setMessages([...newMessages, { sender: 'ai' as 'ai', text: reply }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendTicket = () => {
    if (!pendingAction) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: 'ai', text: `Обращение отправлено в поддержку. Какие у Вас еще будут вопросы по ${pendingAction.deviceInfo}?` }
    ]);
    setPendingAction(null);
  };

  return (
    <Box display="flex" flexDirection="column" height={400}>
      <Box
        ref={chatRef}
        flex={1}
        overflow="auto"
        mb={2}
        p={1}
        bgcolor="#f5f5f5"
        borderRadius={1}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            display="flex"
            justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
            mb={1}
          >
            <Box
              bgcolor={msg.sender === 'user' ? 'primary.main' : 'grey.300'}
              color={msg.sender === 'user' ? 'white' : 'black'}
              px={2}
              py={1}
              borderRadius={2}
              maxWidth="80%"
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
        {pendingAction && (
          <Box display="flex" justifyContent="flex-start" mt={2}>
            <Button variant="contained" color="success" onClick={handleSendTicket}>
              Отправить
            </Button>
          </Box>
        )}
      </Box>
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Введите вопрос..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading || !!pendingAction}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !input.trim() || !!pendingAction}
        >
          Отправить
        </Button>
      </Box>
    </Box>
  );
};

export default AIChat;
