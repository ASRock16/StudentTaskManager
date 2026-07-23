document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('task-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allTasks = []; // Store tasks locally for instant filtering

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
            // Update active button styling
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Render filtered tasks
            const filterValue = e.target.getAttribute('data-filter');
            renderTasks(filterValue);
        });
    });

    // 3. Render Tasks based on filter
    function renderTasks(filter) {
        container.innerHTML = ''; // Clear current cards
        
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
                        
                        // Update the local array and the progress bar
                        const taskIndex = allTasks.findIndex(t => t.id === task.id);
                        allTasks[taskIndex].status = nextStatus;
                        updateProgress();
                    }
                });
            });

            container.appendChild(card);
        });
    }

    // 4. Calculate and Update Progress Bar
    function updateProgress() {
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        document.getElementById('progress-text').innerText = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    // Helper Functions
    function getNextStatus(current) {
        if (current === 'Not Started') return 'In Progress';
        if (current === 'In Progress') return 'Pending Review';
        if (current === 'Pending Review') return 'Completed';
        return 'Not Started';
    }

    function setCardColor(card, status) {
        if (status === 'Not Started') card.style.borderLeftColor = '#4F46E5'; // Indigo
        if (status === 'In Progress') card.style.borderLeftColor = '#F59E0B'; // Amber
        if (status === 'Pending Review') card.style.borderLeftColor = '#06B6D4'; // Cyan
        if (status === 'Completed') card.style.borderLeftColor = '#10B981'; // Emerald
    }
});