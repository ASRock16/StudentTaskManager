const express = require('express');
const app = express();

app.use(express.json()); 
app.use(express.static('public'));

// In-memory array acting as our database
let tasks = [
    { id: 1, title: 'Hardware Integration', status: 'In Progress', assignee: 'Member 1' },
    { id: 2, title: 'Frontend Dashboard', status: 'Pending Review', assignee: 'Member 2' },
    { id: 3, title: 'Backend Logic', status: 'Not Started', assignee: 'Member 3' },
    { id: 4, title: 'Data Analysis', status: 'In Progress', assignee: 'Member 4' },
    { id: 5, title: 'Documentation', status: 'Not Started', assignee: 'Member 5' }
];

// Send tasks to the frontend
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Receive a status update from the frontend
app.post('/api/tasks/update', (req, res) => {
    const { id, newStatus } = req.body;
    
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = newStatus;
        res.json({ success: true, message: 'Task updated' });
    } else {
        res.status(404).json({ success: false, message: 'Task not found' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});