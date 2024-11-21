import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

class FirebaseManager {
    static instance;
    #db;
    #statusCallback;
    #stateCallback;
    #initializationRetries = 0;
    #maxRetries = 3;
    #retryDelay = 1000;

    constructor() {
        if (FirebaseManager.instance) {
            return FirebaseManager.instance;
        }
        FirebaseManager.instance = this;
    }

    async initialize(statusCallback, stateCallback) {
        this.#statusCallback = statusCallback;
        this.#stateCallback = stateCallback;

        try {
            const config = await this.#waitForConfig();
            if (!config) {
                throw new Error('Firebase config missing after retries');
            }

            // Validate required config fields
            const requiredFields = ['apiKey', 'authDomain', 'projectId'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    throw new Error(`Missing required Firebase config field: ${field}`);
                }
            }

            const app = initializeApp(config);
            this.#db = getDatabase();
            
            await this.#testConnection();
            await this.setupSync();
            
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.#statusCallback('Error Connecting ⚠️');
            return false;
        }
    }

    async #waitForConfig() {
        while (this.#initializationRetries < this.#maxRetries) {
            if (window.FIREBASE_CONFIG) {
                try {
                    return typeof window.FIREBASE_CONFIG === 'string' 
                        ? JSON.parse(window.FIREBASE_CONFIG)
                        : window.FIREBASE_CONFIG;
                } catch (e) {
                    console.error('Failed to parse Firebase config:', e);
                }
            }

            console.log(`Waiting for Firebase config... Attempt ${this.#initializationRetries + 1}/${this.#maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, this.#retryDelay));
            this.#initializationRetries++;
        }
        return null;
    }

    async #testConnection() {
        const testRef = ref(this.#db, '.info/connected');
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                unsubscribe();
                reject(new Error('Connection timeout'));
            }, 5000);

            const unsubscribe = onValue(testRef, (snap) => {
                clearTimeout(timeout);
                unsubscribe();
                resolve(snap.val());
            }, (error) => {
                clearTimeout(timeout);
                unsubscribe();
                reject(error);
            });
        });
    }

    async setupSync() {
        const taskId = 'default-task-list';
        const tasksRef = ref(this.#db, `tasks/${taskId}`);
        const connectedRef = ref(this.#db, '.info/connected');

        // Monitor connection status
        onValue(connectedRef, (snap) => {
            const status = snap.val() === true ? 'Connected to Cloud ☁️' : 'Offline Mode 📱';
            this.#statusCallback(status);
        }, (error) => {
            console.error('Connection error:', error);
            this.#statusCallback('Connection Error ⚠️');
        });

        // Monitor data changes
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data && (!window.lastLocalUpdate || Date.now() - window.lastLocalUpdate > 1000)) {
                this.#stateCallback(data);
            }
        }, (error) => {
            console.error('Data sync error:', error);
            this.#statusCallback('Sync Error ⚠️');
        });
    }

    async saveState(state) {
        if (!this.#db) return false;

        try {
            const taskId = 'default-task-list';
            const tasksRef = ref(this.#db, `tasks/${taskId}`);
            await set(tasksRef, state);
            return true;
        } catch (error) {
            console.error('Save error:', error);
            this.#statusCallback('Save Error ⚠️');
            return false;
        }
    }

    // Expose necessary Firebase functions
    get ref() { return ref; }
    get set() { return set; }
    get db() { return this.#db; }
}

export const firebaseManager = new FirebaseManager();