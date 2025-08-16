const { contextBridge, ipcRenderer } = require('electron');
var ByteBuffer = require('bytebuffer');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing(message = 'ping') {
      ipcRenderer.invoke('ipc-example', message);
    },

    // User commands
    refreshInventory() {
      ipcRenderer.invoke('refreshInventory');
    },

    checkSteam() {
      return ipcRenderer.invoke('check-steam');
    },

    closeSteam() {
      return ipcRenderer.invoke('close-steam');
    },
    // User commands
    needUpdate() {
      return new Promise((resolve) => {
        ipcRenderer.invoke('needUpdate');
        ipcRenderer.once('needUpdate-reply', (evt, message) => {
          resolve(message);
        });
      });
    },
    // User account
    getAccountDetails() {
      return new Promise((resolve) => {
        ipcRenderer.invoke('electron-store-getAccountDetails');
        ipcRenderer.once(
          'electron-store-getAccountDetails-reply',
          (evt, message) => {
            resolve(message);
          }
        );
      });
    },

    // User account
    getPossibleOutcomes(resultsToGet) {
      console.log(resultsToGet);
      return new Promise((resolve) => {
        ipcRenderer.invoke('getTradeUpPossible', resultsToGet);
        ipcRenderer.once('getTradeUpPossible-reply', (evt, message) => {
          console.log(message);
          resolve(message);
        });
      });
    },

    // Trade up
    tradeOrder(idsToProcess, idToUse) {
      ipcRenderer.invoke('processTradeOrder', idsToProcess, idToUse);
    },
    //
    setItemsPosition(dictToUse) {
      ipcRenderer.invoke('setItemsPositions', dictToUse);
    },
    //
    OpenContainer(listToUse) {
      ipcRenderer.invoke('openContainer', listToUse);
    },

    // User account
    deleteAccountDetails(username) {
      ipcRenderer.invoke('electron-store-deleteAccountDetails', username);
    },

    // User account
    setAccountPosition(username, indexPosition) {
      ipcRenderer.invoke(
        'electron-store-setAccountPosition',
        username,
        indexPosition
      );
    },

    downloadFile(data) {
      ipcRenderer.invoke('download', data);
    },
    getPrice(itemRows) {
      ipcRenderer.invoke('getPrice', itemRows);
    },
    getCurrencyRate() {
      return new Promise((resolve) => {
        ipcRenderer.invoke('getCurrency');
        ipcRenderer.once('getCurrency-reply', (evt, message) => {
          console.log(message);
          resolve(message);
        });
      });
    },
    // User commands
    retryConnection() {
      ipcRenderer.invoke('retryConnection');
    },
    // User commands
    logUserOut() {
      ipcRenderer.invoke('signOut');
    },
    // User commands
    handleWindowsActions(action_type) {
      ipcRenderer.invoke('windowsActions', action_type);
    },

    // Send Confirm Force
    forceLogin() {
      ipcRenderer.invoke('forceLogin');
    },

    startQRLogin(shouldRemember) {
      return new Promise((resolve) => {
        ipcRenderer.removeAllListeners('login-reply');

        ipcRenderer.invoke('startQRLogin', shouldRemember);
        ipcRenderer.once('login-reply', (event, arg) => {
          resolve(arg);
        });
      });
    },

    cancelQRLogin() {
      ipcRenderer.invoke('cancelQRLogin');
    },

    // USER CONNECTIONS
    loginUser(
      username,
      password,
      shouldRemember,
      authcode,
      sharedSecret,
      clientjstoken
    ) {
      console.log(clientjstoken);

      if (authcode == '') {
        authcode = null;
      }
      if (sharedSecret == '') {
        sharedSecret = null;
      }
      if (clientjstoken == '') {
        clientjstoken = null;
      }
      return new Promise((resolve) => {
        ipcRenderer.invoke(
          'login',
          username,
          password,
          shouldRemember,
          authcode,
          sharedSecret,
          clientjstoken
        );
        ipcRenderer.once('login-reply', (event, arg) => {
          resolve(arg);
        });
      });
    },

    forceLoginReply() {
      return new Promise((resolve) => {
        ipcRenderer.once('login-reply', (event, arg) => {
          resolve(arg);
        });
      });
    },

    userEvents() {
      return new Promise((resolve) => {
        ipcRenderer.once('userEvents', (evt, message) => {
          resolve(message);
        });
      });
    },

    // Commands
    renameStorageUnit(itemID, newName) {
      return new Promise((resolve) => {
        ipcRenderer.invoke('renameStorageUnit', itemID, newName);

        ipcRenderer.once('renameStorageUnit-reply', (event, arg) => {
          resolve(arg);
        });
      });
    },

    // Commands
    getStorageUnitData(itemID, storageName) {
      return new Promise((resolve) => {
        ipcRenderer.invoke('getCasketContents', itemID, storageName);

        ipcRenderer.once('getCasketContent-reply', (event, arg) => {
          resolve(arg);
        });
      });
    },

    // Commands
    moveFromStorageUnit(casketID, itemID, fastMode) {
      // Create a promise that rejects in <ms> milliseconds
      let storageUnitResponse = new Promise((resolve) => {
        ipcRenderer.invoke('removeFromStorageUnit', casketID, itemID, fastMode);

        if (fastMode) {
          resolve(fastMode);
        } else {
          ipcRenderer.once('removeFromStorageUnit-reply', (event, arg) => {
            resolve(arg);
          });
        }
      });
      if (fastMode) {
        return true;
      } else {
        let timeout = new Promise((_resolve, reject) => {
          let id = setTimeout(() => {
            clearTimeout(id);
            reject();
          }, 10000);
        });
        return Promise.race([storageUnitResponse, timeout]);
      }
    },
    // Commands
    moveToStorageUnit(casketID, itemID, fastMode) {
      let storageUnitResponse = new Promise((resolve) => {
        ipcRenderer.invoke('moveToStorageUnit', casketID, itemID, fastMode);
        if (fastMode) {
          resolve(fastMode);
        } else {
          ipcRenderer.once('moveToStorageUnit-reply', (event, arg) => {
            resolve(arg);
          });
        }
      });

      if (fastMode) {
        return true;
      } else {
        let timeout = new Promise((_resolve, reject) => {
          let id = setTimeout(() => {
            clearTimeout(id);
            reject();
          }, 10000);
        });

        return Promise.race([storageUnitResponse, timeout]);
      }
    },

    on(channel, func) {
      const validChannels = [
        'ipc-example',
        'login',
        'userEvents',
        'refreshInventory',
        'renameStorageUnit',
        'removeFromStorageUnit',
        'errorMain',
        'signOut',
        'retryConnection',
        'needUpdate',
        'download',
        'electron-store-getAccountDetails',
        'electron-store-get',
        'electron-store-set',
        'pricing',
        'getPrice',
        'windowsActions',
        'getTradeUpPossible',
        'processTradeOrder',
        'setItemsPositions',
        'openContainer',
        'forceLogin',
        'checkSteam',
        'closeSteam',
        'updater',
        'startQRLogin',
        'cancelQRLogin',
        'qrLogin:show',
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [
        'ipc-example',
        'login',
        'userEvents',
        'refreshInventory',
        'renameStorageUnit',
        'removeFromStorageUnit',
        'errorMain',
        'signOut',
        'retryConnection',
        'needUpdate',
        'download',
        'electron-store-getAccountDetails',
        'electron-store-get',
        'electron-store-set',
        'pricing',
        'getPrice',
        'windowsActions',
        'getTradeUpPossible',
        'processTradeOrder',
        'setItemsPositions',
        'openContainer',
        'forceLogin',
        'checkSteam',
        'closeSteam',
        'updater',
        'startQRLogin',
        'cancelQRLogin',
        'qrLogin:show',
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
  store: {
    // Commands
    get(val) {
      const key =
        Math.random().toString(36).substr(2, 3) +
        '-' +
        Math.random().toString(36).substr(2, 3) +
        '-' +
        Math.random().toString(36).substr(2, 4);
      return new Promise((resolve) => {
        ipcRenderer.invoke('electron-store-get', val, key);

        ipcRenderer.once('electron-store-get-reply' + key, (event, arg) => {
          console.log(arg);
          resolve(arg);
        });
      });
    },
    set(property, val) {
      ipcRenderer.invoke('electron-store-set', property, val);
    },
  },
});
