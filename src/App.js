import React, { useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import Todo from './components/Todo';
import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import ClientCaptcha from "react-client-captcha";
import "react-client-captcha/dist/index.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
const q = query(collection(db, 'todos'), orderBy('timestamp', 'desc'));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const QuoteList = React.memo(function QuoteList({ quotes, deleteTodo }) {
  return quotes.map((quote, index) => (
    <Draggable draggableId={quote.id} index={index} key={index}>
      {provided => (
        <>
          <ul ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}>
            <Todo arr={quote} deleteTodo={deleteTodo} />
          </ul>
        </>
      )}
    </Draggable>
  ));
});


function App() {
  const [state, setState] = useState({ todos: [] });
  const [input, setInput] = useState('');
  const [taskId, setTaskId] = useState();
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    onSnapshot(q, (snapshot) => {
      setState({
        todos: snapshot.docs.map(doc => ({
          id: doc.id,
          item: doc.data()
        }))
      })
    })
  }, []);
  const addTodo = (e) => {
    e.preventDefault();

    let result = input.trim();
    if (result) {
      addDoc(collection(db, 'todos'), {
        todo: input,
        timestamp: serverTimestamp()
      })
      setInput('')
      toast.success('Task added successfully');
    } else {
      toast.error('Please enter task');
    }
  };

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const todos = reorder(
      state.todos,
      result.source.index,
      result.destination.index
    );
    setState({ todos });
  }

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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <QuoteList quotes={state?.todos} deleteTodo={deleteTodo} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
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