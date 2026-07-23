const express = require('express');
const app = express();

app.use(express.json()); 
app.use(express.static('public'));

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

// Receive a status update for an existing task
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

// Create a brand-new task
app.post('/api/tasks', (req, res) => {
    const { title, assignee } = req.body;
    
    // Find the highest existing ID and add 1
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const newTask = {
        id: newId,
        title: title,
        status: 'Not Started', 
        assignee: assignee || 'Member 1'
    };
    
    tasks.push(newTask);
    res.json({ success: true, task: newTask });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running without MongoDB.');
});