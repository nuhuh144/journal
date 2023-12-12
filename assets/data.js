// IndexedDBStorage.js

// Function to open or create a database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MyDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('keyValueStore', { keyPath: 'key' });
        };

        request.onsuccess = () => {
            const db = request.result;
            resolve(db);
        };

        request.onerror = () => {
            reject(new Error('Error opening database'));
        };
    });
}

// Function to write a key-value pair to the database
async function writevar(key, value) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['keyValueStore'], 'readwrite');
        const store = transaction.objectStore('keyValueStore');

        const request = store.put({ key, value });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error('Error writing to database'));
        };
    });
}

// Function to read a value by key from the database
async function readvar(key) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['keyValueStore'], 'readonly');
        const store = transaction.objectStore('keyValueStore');

        const request = store.get(key);

        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                resolve(result.value);
            } else {
                resolve(null); // Key not found
            }
        };

        request.onerror = () => {
            reject(new Error('Error reading from database'));
        };
    });
}

// Function to delete a key from the database
async function deletevar(key) {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['keyValueStore'], 'readwrite');
        const store = transaction.objectStore('keyValueStore');

        const request = store.delete(key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error('Error deleting from database'));
        };
    });
}

export { writevar, readvar, deletevar };
