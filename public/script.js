document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('task-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskForm = document.getElementById('add-task-form');
    let allTasks = []; 

    // 1. Initial Data Fetch
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            allTasks = tasks;
            renderTasks('All');
            updateProgress();
        });

    // 2. Filter Button Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filterValue = e.target.getAttribute('data-filter');
            renderTasks(filterValue);
        });
    });

    // 3. Add New Task Logic
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const titleInput = document.getElementById('task-title').value;
        const assigneeInput = document.getElementById('task-assignee').value;

        fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleInput, assignee: assigneeInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Add the new task to the local array
                allTasks.push(data.task);
                
                // Keep the current filter active when rendering the new task
                const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
                renderTasks(activeFilter);
                updateProgress();
                
                // Clear the text box for the next input
                taskForm.reset(); 
            }
        });
    });

    // 4. Render Tasks
    function renderTasks(filter) {
        container.innerHTML = ''; 
        
        const filteredTasks = filter === 'All' 
            ? allTasks 
            : allTasks.filter(t => t.assignee === filter);

        filteredTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.style.cursor = 'pointer';
            setCardColor(card, task.status);

            card.innerHTML = `
                <h3>${task.title}</h3>
                <p>Status: <span class="status-text">${task.status}</span></p>
                <span class="assignee">${task.assignee}</span>
            `;

            // Click event to update status
            card.addEventListener('click', () => {
                const statusSpan = card.querySelector('.status-text');
                let nextStatus = getNextStatus(statusSpan.innerText);
                
                fetch('/api/tasks/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: task.id, newStatus: nextStatus })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        statusSpan.innerText = nextStatus;
                        setCardColor(card, nextStatus);
                        
                        const taskIndex = allTasks.findIndex(t => t.id === task.id);
                        allTasks[taskIndex].status = nextStatus;
                        updateProgress();
                    }
                });
            });

            container.appendChild(card);
        });
    }

    // 5. Calculate Progress
    function updateProgress() {
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        document.getElementById('progress-text').innerText = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    // Helpers
    function getNextStatus(current) {
        if (current === 'Not Started') return 'In Progress';
        if (current === 'In Progress') return 'Pending Review';
        if (current === 'Pending Review') return 'Completed';
        return 'Not Started';
    }

    function setCardColor(card, status) {
        if (status === 'Not Started') card.style.borderLeftColor = '#4F46E5'; 
        if (status === 'In Progress') card.style.borderLeftColor = '#F59E0B'; 
        if (status === 'Pending Review') card.style.borderLeftColor = '#06B6D4'; 
        if (status === 'Completed') card.style.borderLeftColor = '#10B981'; 
    }
});