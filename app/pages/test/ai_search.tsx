import React, { useState } from 'react';
import {FormControlLabel, Checkbox, Box, Typography} from '@mui/material';
import { ExtendMessageModel } from '@/types'; // Add this import statement
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, Message, MessageInput, MessageList, MessageModel } from '@chatscope/chat-ui-kit-react';
import { v4 as uuidv4 } from 'uuid';
import { customLog } from '@/utils/customLog';


import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


// ページコンポーネント
  const ChatWithAiTest = () => {
  const [useSummary, setUseSummary] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // メッセージのstateを作成
  const [messages, setMessages] = useState<Array<ExtendMessageModel>>([]);
  // const [messages, setMessages] = useState<Array<ExtendMessageModel>>([
  //   {
  //     id: uuidv4(),
  //     message: "初期入力メッセージ",
  //     sentTime: "just now",
  //     sender: "Bot",
  //     direction: "outgoing",
  //     position: "single"
  //   }
  // ]);

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

  const fetchData = async (context: string): Promise<string> => {
    //let data: any = undefined;
    let data: any = undefined;
    try{
        data = await fetch('/api/getCustomMessageFromAiSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //body: JSON.stringify({ message: context, useSummary, useFallback }),
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
  };

  // Pageコンポーネント
  return (
    <div>
<AppBar position="static">
  <Toolbar variant="dense">
    {/* <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
      <MenuIcon />
    </IconButton> */}
    <Typography variant="h6" color="inherit" component="div">
      社内情報検索(Azure AI Search)
    </Typography>
  </Toolbar>
</AppBar>
      <div style={{ marginBottom: '-15px' }}>
        <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果をAzureOpenAIを使用して要約する" />
      </div>
      <div>
        <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果が存在しない場合、AzureOpenAIを使用して一般的な回答を取得する" />
      </div>
      <div style={{ position: "relative", height: "500px" }}>
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
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}
export default ChatWithAiTest;

export interface ExtendMessageModel extends MessageModel {
  id?: string;
}