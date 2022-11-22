import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import Todo from './components/Todo';
import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import ClientCaptcha from "react-client-captcha";
import "react-client-captcha/dist/index.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ReactSortable } from "react-sortablejs";

import './App.css';
const q = query(collection(db, 'todos'), orderBy('timestamp', 'asc'));

function App() {
  const [tempItem, setTempItem] = useState([]);
  const [input, setInput] = useState('');
  const [taskId, setTaskId] = useState();
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    onSnapshot(q, (snapshot) => {

      setTasks(snapshot.docs.map(doc => ({
        id: doc.id,
        item: doc.data()
      }))
      )
      setTempItem(snapshot.docs.map(doc => ({
        id: doc.id,
        item: doc.data()
      }))
      )
    })
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    let result = input.trim();
    if (result) {
      addDoc(collection(db, 'todos'), {
        name: input,
        timestamp: serverTimestamp()
      })
      setInput('')
      toast.success('Task added successfully');
    } else {
      toast.error('Please enter task');
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInputCode()
    setTaskId()
  };

  const handleSubmit = () => {
    if (captchaCode === inputCode) {
      deleteDoc(doc(db, 'todos', taskId))
      setInputCode()
      setTaskId()
      setOpen(false);
      toast.success('Task deleted successfully');
    }
    else {
      toast.error('Captcha input is not correct');
    }
  }
  const deleteTodo = (id) => {
    setTaskId(id)
    handleClickOpen()
  };

  const setCode = (captchaCode) => {
    setCaptchaCode(captchaCode);
  };
  return (
    <div className="App">
      <ToastContainer />

      <h2> THINGS TO DO:</h2>
      <ReactSortable list={tasks} setList={setTasks}>
        {tasks.map((item) => (
          <div key={item.id}>
            <Todo arr={item} deleteTodo={deleteTodo} />
          </div>
        ))}
      </ReactSortable>
      <form onSubmit={addTodo}>
        <TextField id="outlined-basic" label="Task" variant="outlined" style={{ margin: "0px 5px" }} size="small" value={input}
          onChange={e => setInput(e.target.value)} />
        <Button variant="contained" color="primary" type='submit'>ADD TASK</Button>
      </form>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure want to delete this task?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <ClientCaptcha
              captchaCode={setCode}
              width={200}
            />
            <input
              type="text"
              placeholder="Enter Captach"
              onChange={(e) => setInputCode(e.target.value)}
              value={inputCode}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default App;