document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('task-container');

    // 1. Ask the server for the task data
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            // Loop through the data and build a card for each task
            tasks.forEach(task => renderTask(task));
        });

    // 2. Function to build and inject the HTML cards
    function renderTask(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.style.cursor = 'pointer';
        
        setCardColor(card, task.status);

        card.innerHTML = `
            <h3>${task.title}</h3>
            <p>Status: <span class="status-text">${task.status}</span></p>
            <span class="assignee">${task.assignee}</span>
        `;

        // 3. Click event to update the status in the backend
        card.addEventListener('click', () => {
            const statusSpan = card.querySelector('.status-text');
            let nextStatus = getNextStatus(statusSpan.innerText);
            
            // Send the new status to the server
            fetch('/api/tasks/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, newStatus: nextStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Only update the screen if the server successfully saved it
                    statusSpan.innerText = nextStatus;
                    setCardColor(card, nextStatus);
                }
            });
        });

        container.appendChild(card);
    }

    // Helper functions for logic and colors
    function getNextStatus(current) {
        if (current === 'Not Started') return 'In Progress';
        if (current === 'In Progress') return 'Pending Review';
        if (current === 'Pending Review') return 'Completed';
        return 'Not Started';
    }

    function setCardColor(card, status) {
        if (status === 'Not Started') card.style.borderLeftColor = '#0066cc';
        if (status === 'In Progress') card.style.borderLeftColor = '#ffc107';
        if (status === 'Pending Review') card.style.borderLeftColor = '#17a2b8';
        if (status === 'Completed') card.style.borderLeftColor = '#28a745';
    }
});