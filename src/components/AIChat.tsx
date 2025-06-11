import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, CircularProgress, Paper, IconButton, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { sendMessageToAI } from '../services/aiService';
import { marked } from 'marked';

const SBER_GREEN = '#21A038';
const SBER_LIGHT = '#F4F7F6';
const SBER_ACCENT = '#00C95F';

interface AIChatProps {
  employee: any;
  device: any;
  onClose: () => void;
  compactInput?: boolean;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  action?: {
    type: string;
    payload: any;
  };
}

const AIChat: React.FC<AIChatProps> = ({ employee, device, onClose, compactInput }) => {
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
    const deviceTitle = device?.nomenclature && device?.model
      ? `${device.nomenclature} (${device.model})`
      : device?.model || device?.nomenclature || '';
    setMessages((msgs) => [
      ...msgs,
      { sender: 'ai', text: `Обращение отправлено в поддержку. Какие у Вас еще будут вопросы по ${deviceTitle}?` }
    ]);
    setPendingAction(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: SBER_LIGHT,
        borderRadius: 3,
        position: 'relative',
      }}
    >
      <Box
        ref={chatRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: SBER_LIGHT,
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            display="flex"
            justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
            mb={1}
          >
            <Box
              sx={{
                bgcolor: msg.sender === 'user' ? SBER_GREEN : '#fff',
                color: msg.sender === 'user' ? 'white' : 'black',
                px: 2,
                py: 1,
                borderRadius: 2,
                maxWidth: '80%',
                boxShadow: 1,
              }}
            >
              {msg.sender === 'ai' ? (
                <Box
                  component="span"
                  sx={{ fontSize: '0.98rem', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }}
                />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} sx={{ color: SBER_GREEN }} />
          </Box>
        )}
        {pendingAction && (
          <Box display="flex" flexDirection="column" alignItems="flex-start" mt={2}>
            <Box
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: 1,
                p: 2,
                width: '100%',
                minWidth: 0,
                position: 'relative',
                minHeight: 64,
                mb: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', width: '100%' }}>
                {pendingAction.text}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  color: SBER_GREEN,
                  borderColor: SBER_GREEN,
                  fontWeight: 700,
                  borderRadius: 2,
                  minWidth: 90,
                  height: 32,
                  mt: 1.5,
                  mr: 1.5,
                  textTransform: 'none',
                  background: '#fff',
                  boxShadow: 0,
                  alignSelf: 'flex-end',
                  '&:hover': {
                    borderColor: SBER_ACCENT,
                    color: SBER_ACCENT,
                    background: '#f4fff6',
                  },
                }}
                onClick={handleSendTicket}
              >
                Отправить
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: compactInput ? 1 : 2,
          bgcolor: SBER_LIGHT,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Введите вопрос..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading || !!pendingAction}
          sx={{
            bgcolor: 'white',
            borderRadius: 2,
            mr: 1,
            height: compactInput ? 36 : undefined,
            '& .MuiOutlinedInput-root': {
              height: compactInput ? 36 : undefined,
              fontSize: compactInput ? '0.95rem' : undefined,
              '& fieldset': {
                borderColor: SBER_ACCENT,
              },
              '&:hover fieldset': {
                borderColor: SBER_GREEN,
              },
              '&.Mui-focused fieldset': {
                borderColor: SBER_GREEN,
              },
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={loading || !input.trim() || !!pendingAction}
          sx={{
            bgcolor: SBER_GREEN,
            color: 'white',
            borderRadius: '50%',
            width: 36,
            height: 36,
            minWidth: 36,
            minHeight: 36,
            ml: 0.5,
            boxShadow: 2,
            '&:hover': {
              bgcolor: SBER_ACCENT,
            },
          }}
        >
          <SendIcon fontSize="small" sx={{ transform: 'rotate(-90deg)' }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default AIChat;
