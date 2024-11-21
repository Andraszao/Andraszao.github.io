// Performance monitoring
export const performance = {
    marks: {},
    start(operation) {
        this.marks[operation] = Date.now();
    },
    end(operation) {
        if (this.marks[operation]) {
            const duration = Date.now() - this.marks[operation];
            console.debug(`${operation} took ${duration.toFixed(2)}ms`);
            delete this.marks[operation];
        }
    }
};

// Debounce utility
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// State management utilities
export const StateManager = {
    lastLocalUpdate: null,
    
    markLocalUpdate() {
        this.lastLocalUpdate = Date.now();
    },
    
    shouldProcessRemoteUpdate() {
        return !this.lastLocalUpdate || Date.now() - this.lastLocalUpdate > 1000;
    }
};

// Local storage utilities
export const Storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
};

// Feature detection
export const features = {
    dragAndDrop: 'draggable' in document.createElement('div'),
    crypto: window.crypto && 'randomUUID' in crypto,
    localStorage: (() => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    })()
};

// Undo stack implementation
export const UndoStack = {
    stack: [],
    maxSize: 50,
    
    push(state) {
        this.stack.push(JSON.stringify(state));
        if (this.stack.length > this.maxSize) {
            this.stack.shift();
        }
        sessionStorage.setItem('undoStack', JSON.stringify(this.stack));
    },
    
    pop() {
        const state = this.stack.pop();
        sessionStorage.setItem('undoStack', JSON.stringify(this.stack));
        return state ? JSON.parse(state) : null;
    }
};