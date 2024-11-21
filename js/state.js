async function saveState() {
    performance.start('saveState');
    try {
        const state = {
            projectName: document.querySelector('.project-name').textContent || 'Wish Upon',
            categories: Array.from(document.querySelectorAll('.task-group')).map(group => ({
                id: group.dataset.id,
                name: group.querySelector('.category-name')?.textContent,
                label: group.querySelector('.category-label')?.textContent || 'Category',
                isExpanded: group.querySelector('.task-list')?.style.display !== 'none',
                tasks: Array.from(group.querySelectorAll('.task-item')).map(task => ({
                    id: task.dataset.id,
                    title: task.querySelector('.task-title')?.textContent || 'New Task',
                    completed: task.querySelector('.task-status')?.classList.contains('completed') || false,
                    assignee: task.querySelector('.task-assign')?.textContent || 'Unassigned',
                    createdAt: task.dataset.createdAt || new Date().toISOString(),
                    tags: Array.from(task.querySelectorAll('.task-tag'))
                        .map(tag => tag.dataset.tag)
                }))
            })).filter(category => category.id && category.name)
        };

        // Mark local update and save
        window.markLocalUpdate();
        localStorage.setItem('taskState', JSON.stringify(state));

        // Save to Firebase if available
        await firebaseManager.saveState(state);
    } catch (error) {
        console.error('Error saving state:', error);
        updateSyncStatus('Error saving changes ⚠');
    }
    performance.end('saveState');
}