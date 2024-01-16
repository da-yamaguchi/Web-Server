
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Modal, Paper, TextField, Typography } from '@mui/material';

const App = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  
  return (
    <>
      <Button onClick={handleOpen}>ログイン画面へ</Button>
      <Modal open={open} onClose={handleOpen}>
        <StyledPaper>
          <form className='form'>
            <Typography variant={'h5'}>ログイン</Typography>
            <TextField label="メールアドレス" variant="standard" className="text" />
            <TextField label="パスワード" variant="standard" className="text" />
            <center><Button className="login btn">ログイン</Button></center>
            <center><Button className="signup btn">新規会員登録はこちら</Button></center>
            <center><Button  variant="outlined">閉じる</Button></center>
          </form>
        </StyledPaper>
      </Modal>
    </>
  );
};

const StyledPaper = styled(Paper)`
  display: flex;
  justify-content: center;
  width: 960px;
  height: 540px;
  .form {
    width: 60%;
    margin: 3rem;
    text-align: center;
  }
  .text {
    width: 100%;
    margin: 1rem 0;
  }
  .btn {
    width: 60%;
    color: white;
    text-align: center;
    margin: 1.5rem 0;
  }
  .login {
    background-color: lightseagreen;
  }
  .signup {
    background-color: #06579b;
  }
`;

export default App;
