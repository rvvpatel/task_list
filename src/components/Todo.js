import { List, ListItem, ListItemText } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Checkbox from '@mui/material/Checkbox';
const Todo = ({ arr, deleteTodo }) => {
    return (
        <List className="todo__list">
            <ListItem>
                <Checkbox />
                <ListItemText primary={arr.item.todo} />
            </ListItem>
            <ClearIcon fontSize="large" style={{ opacity: 0.7 }} onClick={() => deleteTodo(arr.id)} />
        </List>
    )
};
export default Todo;