import React, { useState } from 'react';
import {FormControlLabel, Checkbox, Box, Typography} from '@mui/material';
import { ExtendMessageModel } from '@/types'; // Add this import statement
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MainContainer, Message, MessageInput, MessageList, MessageModel } from '@chatscope/chat-ui-kit-react';
import { v4 as uuidv4 } from 'uuid';
import { customLog } from '@/utils/customLog';


//import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MonitorIcon from '@mui/icons-material/Monitor';
import HelpIcon from '@mui/icons-material/Help';
import Popover from '@mui/material/Popover';

// Material UI drawer sample code start
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// Material UI drawer sample code end


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

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Pageコンポーネント
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar variant="dense">
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            社内情報検索(Azure AI Search)
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Chat Setting">
            <IconButton edge="end" color="inherit" aria-label="settings" onClick={handleClick} sx={{ marginRight: 0.5 }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Popover
            id={id}
            open={openPopover}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            {/* <Typography sx={{ p: 2 }}>The content of the Popover.</Typography> */}
            <Box style={{ marginBottom: '-15px' }}>
              <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果をAzureOpenAIを使用して要約する" />
            </Box>
            <Box>
              <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果が存在しない場合、AzureOpenAIを使用して一般的な回答を取得する" />
            </Box>
          </Popover>
          <Tooltip title="Help">
            <IconButton edge="end" color="inherit" aria-label="settings">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Home', 'AzureOpenAI', 'QA Search', 'Mail Checker'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                <MonitorIcon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        {/* <Box style={{ marginBottom: '-15px' }}>
          <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果をAzureOpenAIを使用して要約する" />
        </Box>
        <Box>
          <FormControlLabel control={<Checkbox defaultChecked  size="small"/>} label="AI Search結果が存在しない場合、AzureOpenAIを使用して一般的な回答を取得する" />
        </Box> */}
        <Box style={{ position: "relative", height: "500px" }}>
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
        </Box>
      </Main>
    </Box>
  );
}
export default ChatWithAiTest;

export interface ExtendMessageModel extends MessageModel {
  id?: string;
}