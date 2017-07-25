const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu
const ipc = require('electron').ipcMain

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon = null

ipc.on('esc-clicked', function (event) {
  if(mainWindow) mainWindow.hide();
})

function createTrayIcon() {
  const iconName = 'icon.ico';
  const iconPath = path.join(__dirname, iconName)
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Exit', click: function () { app.exit(0); } }
  ]);
  appIcon.setToolTip('Search n Copy')
  appIcon.setContextMenu(contextMenu)
  appIcon.on('click', function(){
    if(mainWindow){
      if(mainWindow.isVisible()){
        mainWindow.hide();
      }else{
        mainWindow.show();
      }
    }
  })
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 560, height: 400, closable: false, resizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.setMenu(null);

  mainWindow.on('minimize',function(event){
    event.preventDefault()
    mainWindow.hide();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function (event) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  if(appIcon === null){
    createTrayIcon();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (appIcon) appIcon.destroy()
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
