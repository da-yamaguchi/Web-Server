import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import {FormControlLabel, Checkbox, Box, Typography} from '@mui/material';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  MessageModel,
  InputToolbox,
  AttachmentButton,
  SendButton } from '@chatscope/chat-ui-kit-react';
import { v4 as uuidv4 } from 'uuid';
import { customLog } from '@/utils/customLog';

const ChatBot = () => {
  const [messages, setMessages] = useState<Array<ExtendMessageModel>>([]);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // メッセージの送信機能の追加
  const handleSendMessage = async (messageText:string) => {
    // サーバーに送信されたメッセージをmessagesに反映する.
    const newMessage: ExtendMessageModel = {
      id: uuidv4(),
      message: messageText,
      sentTime: "just now",
      sender: "User",
      direction: "incoming",
      position: "single"
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // AIによる返答を作成する.
    try {
      const replyMessageText: string = await fetchData(messageText);
      const replyMessage: ExtendMessageModel = {
        id: uuidv4(),
        message: replyMessageText,
        sentTime: "just now",
        sender: "Bot",
        direction: "outgoing",
        position: "single"
      };
      setMessages(prevMessages => [...prevMessages, replyMessage]);
    } catch (error) {
      console.error('Error while sending message:', error);
    }
  };
  
  return (
    <Box style={{ height: '100vh', overflow: 'hidden' }}>
        <iframe
          title="Your Company Website"
          src="https://www.link-tech.co.jp/"
          width="100%"
          height="100%"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      <Button
        variant="contained"
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
        }}
      >
        チャット
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* ここにチャットボットのコンテンツを配置 */}
        <Box style={{ padding: '20px' }}>
          {/* チャットボットのコンテンツがここに入ります。 */}
          <Typography variant="h6" color="inherit" component="div">
          採用関連Bot
          </Typography>
          {/* <h1>採用関連Bot</h1> */}
            <Box style={{ position: "relative", height: "500px", width: "250px"}}>
                <MainContainer>
                <ChatContainer>
                    <MessageList>
                    {messages.map(msg => (
                        <Message key={msg.id} model={msg} />
                    ))}
                    </MessageList>
                    <MessageInput
                    placeholder="Type message here"
                    onSend={(value: string) => handleSendMessage(value)}
                    sendButton={false}
                    attachButton={false}
                    />
                </ChatContainer>
                </MainContainer>
            </Box>
        </Box>
      </Popover>
    </Box>
  );
};

// APIを叩いてレスポンスを受ける.
async function fetchData(context:string): Promise<string> {
    let data: any = undefined;
    try{
      data = await fetch('/api/getCustomMessageFromChatGPT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: context }),
      });
    }catch(e){
      console.log("Error : chat_ai_test.tsx is bad function");
      console.log(e);
      return "API接続エラーです.";
    }
    if (data.ok) {
      const response = await data.json();
      if(response.success) {
        return response.message;
      } else {
        customLog("response message is empty" + response.message);
        return response.message;
      }
    } else {
      customLog("response was failed");
      return "エラーです";
    }   
}
  
export default ChatBot;

export interface ExtendMessageModel extends MessageModel {
    id?: string;
}
