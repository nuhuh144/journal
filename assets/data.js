// huge pile of shit mixed with decent code
// if you have any optimizations/better code for this pls dm me: @illchangethislater on discord

const DB_NAME = "WebDeskStore";
const STORE_NAME = "WebDeskDB";
let NTName = "database"; // Default value

// Check if the "db" URL parameter is present
const urlParams = new URLSearchParams(window.location.search);
const dbParam = urlParams.get("db");

if (dbParam) {
  NTName = dbParam;
} else {
  console.log(`[NTE] In the database utility or WebDesk doesn't have a db variable defined.`);
}
// Open IndexedDB
// Initialize the IndexedDB
let dbPromise = null;

function initDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const request = indexedDB.open(NTName, 1);

      request.onerror = (event) => {
        reject("[CRT] Error opening the database: " + event.target.errorCode);
        panic('Database could not be opened, crash!');
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore('settings', { keyPath: 'name' });
        objectStore.transaction.oncomplete = () => {
          resolve(db);
        };
      };
    }, 500);
  });

  return dbPromise;
}


// Read a variable from the database
async function readvar(varName) {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readonly');
    const objectStore = transaction.objectStore('settings');
    const request = objectStore.get(varName);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.value : undefined);
      };

      request.onerror = (event) => {
        reject("[ERR] Error reading variable: " + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// Write a variable to the database
async function writevar(varName, value) {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readwrite');
    const objectStore = transaction.objectStore('settings');
    objectStore.put({ name: varName, value });
    transaction.onerror = (event) => {
      console.error("[ERR] Error writing variable: " + event.target.errorCode);
    };
  } catch (error) {
    console.error(error);
  }
}

async function deletevar(varName) {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readwrite');
    const objectStore = transaction.objectStore('settings');
    objectStore.delete(varName);
    transaction.onerror = (event) => {
      console.error("[ERR] Error deleting variable: " + event.target.errorCode);
    };
  } catch (error) {
    console.error(error);
  }
}

async function eraseall() {
  try {
    const db = await initDB();
    // we dont leave the shell behind no more (erase everything)
    indexedDB.deleteDatabase(NTName);
    console.log('[OK] Erased container successfully.');
  } catch (error) {
    console.error(error);
  }
}

async function burnitall() {
  try {
    await eraseall();
    console.log('[OK] All data has been destroyed.');
    walert('<p>Erase in progress...</p><button class="b1" onclick="window.location.reload();">Reload</button>', 'Erase Assistant', '200px');
    tolayer1('killerase' + NTName);
  } catch (error) {
    console.log('[CRT] Erase failed! Details: ' + error);
    walert('<p>Failed to finish erase</p><p>This is a severe error. Please open Inspector and send a screenshot of this error and the contents of the console to <a href="https://discord.gg/5F7rvssBTJ", target="_blank">this discord server.</a></p><button class="b1" onclick="window.location.reload();">Exit (a probably broken) Container</button><button class="b1" onclick="window.location.reload();">Reload</button>', 'Reset Error', '450px');
    panic()
  }
}
// Function to backup all variables
async function backupVariables() {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readonly');
    const objectStore = transaction.objectStore('settings');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      const variables = event.target.result;
      const backupData = JSON.stringify(variables);
      const blob = new Blob([backupData], { type: 'application/json' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `webdesk_backup_${new Date().toLocaleDateString()}.json`;
      downloadLink.click();
    };

    request.onerror = (event) => {
      console.error("[ERR] Error fetching variables: " + event.target.errorCode);
    };
  } catch (error) {
    console.error(error);
  }
}

// Function to restore variables from a JSON file
async function restoreVariables(file) {
  try {
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      const backupData = event.target.result;
      const variables = JSON.parse(backupData);

      const db = await initDB();
      const transaction = db.transaction('settings', 'readwrite');
      const objectStore = transaction.objectStore('settings');

      // Clear existing variables before restoring
      objectStore.clear();

      // Restore variables from the backup
      for (const variable of variables) {
        objectStore.put(variable);
      }

      walert("<p>Restore completed with no errors!</p><p>It's recommended to reboot, not doing so will cause errors.</p><button class='b1' onclick='reboot();'>Reload</button>", "Migration Assistant");
      loadall();
    };

    fileReader.readAsText(file);
  } catch (error) {
    console.error(error);
  }
}

// Event listener for the Backup button
const backupBtn = document.getElementById('backupBtn');
if (backupBtn) {
  backupBtn.addEventListener('click', () => {
    backupVariables();
  });
}

// Event listener for the Restore button
const restoreBtn = document.getElementById('restoreBtn');
if (restoreBtn) {
  restoreBtn.addEventListener('click', () => {
    const fileInput = document.getElementById('restoreInput');
    const file = fileInput.files[0];
    if (file) {
      restoreVariables(file);
    } else {
      alert('Please select a valid JSON file for restoration.');
    }
  });
}

async function apprestore() {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readonly'); // Change 'WebDeskStore' to 'settings'
    const objectStore = transaction.objectStore('settings');

    // Fetch all app information from the IndexedDB database
    const request = objectStore.getAllKeys();
    request.onsuccess = (event) => {
      const appKeys = event.target.result.filter((key) => key.startsWith('app_'));
      for (const appKey of appKeys) {
        readvar(appKey).then((appInfo) => {
          installapp(appInfo.url, appInfo.name, appInfo.width, appInfo.height, true);
        });
      }
    };

    request.onerror = (event) => {
      console.error('Error fetching app keys: ' + event.target.errorCode);
    };
  } catch (error) {
    console.error(error);
  }
}

// Function to uninstall an app
async function uninstallapp(appId) {
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readwrite');
    const objectStore = transaction.objectStore('settings');

    // Remove the app's information from IndexedDB
    await objectStore.delete(appId);

    // Remove the app key from the 'app_keys' array
    const appKeys = await readvar('app_keys');
    if (appKeys && Array.isArray(appKeys)) {
      const updatedAppKeys = appKeys.filter((key) => key !== appId);
      await writevar('app_keys', updatedAppKeys);
    }

    walertold('Uninstalled successfully!', '1', false);
  } catch (error) {
    console.error(error);
    walertold(`An error occured while uninstalling: ${error}`, '1', false);
  }
}

async function imgoinginsane() {
  // boilerplate code derived from listAppsForUninstall or whatever idrc
  try {
    const db = await initDB();
    const transaction = db.transaction('settings', 'readonly');
    const objectStore = transaction.objectStore('settings');
    const request = objectStore.getAllKeys();
    request.onsuccess = (event) => {
      const appKeys = event.target.result.filter((key) => key.startsWith('con'));
      const uninstallList = document.getElementById('conts');

      for (const appKey of appKeys) {
        readvar(appKey).then((appInfo) => {
          if (appInfo) {
            const listItem = document.createElement('div');
            listItem.classList.add('list');
            listItem.id = `con${appInfo}`
            listItem.innerText = appInfo + " ";

            const useButton = document.createElement('button');
            useButton.classList.add("b4");
            useButton.innerText = 'Use';
            useButton.addEventListener('click', function () {
              const frame = document.getElementById('deskframe');
              frame.src = `./webdesk.html?db=${appInfo}`;
              frame.style.display = "block";
            });
            const delButton = document.createElement('button');
            delButton.classList.add("b4");
            delButton.innerText = 'Destroy';
            delButton.addEventListener('click', function () {
              const frame = document.getElementById('deskframe');
              frame.src = `./assets/reset.html?db=${appInfo}`;
              frame.style.display = "block";
            });

            listItem.appendChild(useButton);
            listItem.appendChild(delButton);
            uninstallList.appendChild(listItem);
          }
        });
      }
    };

    request.onerror = (event) => {
      console.error('Error fetching app keys: ' + event.target.errorCode);
    };
  } catch (error) {
    console.error(error);
  }
}
// Past the point of management
// Past the point of management
// Past the point of management
// Past the point of management
// Past the point of management
// Past the point of management
function corrupt(error) {
  walert("<p>WebDesk is corrupt. Please reboot to recovery and use AutoFix or erase.</p><p>FS error: <span id='debugerror'></span><p>You can continue but it's not recommended.</p>", "WebFS error");
  document.getElementById("debugerror").innerHTML = error;
}
console.log('[OK] webfs.js has arrived! DB_NAME: ' + DB_NAME, " STORE_NAME: " + STORE_NAME);