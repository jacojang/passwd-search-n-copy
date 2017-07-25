// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let db = require("./db.js")
const {dialog} = require('electron').remote;
var ncp = require("copy-paste");
const ipc = require('electron').ipcRenderer

let file_sel = document.getElementById("file_sel");
let update_btn = document.getElementById("update_btn");
let search_input = document.getElementById("search_input");
let result_body = document.getElementById("result_body");

window.addEventListener('load', function(){
  db.loadDB();
  search_input.focus();
  window.addEventListener('keyup', function(e){
      console.log(e);
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      ipc.send('esc-clicked');
    }
  }, true);

});

update_btn.addEventListener('click', function(){
  dialog.showOpenDialog(
    {
      filters:[
        {name: 'CSV', extensions: ['csv']},
        {name: 'All Files', extensions: ['*']}
      ]
    }, (fileNames) => {
    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
        console.log("No file selected");
        return;
    }

    db.updateDB(fileNames[0], function(msg){
      alert(msg);
    });
  });
});

search_input.addEventListener('keyup', function(){
  try{
    let keyword = search_input.value.trim();

    // clear table
    clearTbody(result_body);
    if(!keyword || keyword.length < 1){
      return;
    }

    // searching
    let results = db.search(keyword);

    // render table
    console.log(keyword, results);
    renderTbody(result_body, results)
  } catch(e){
    console.log(e);
  }
})

function clearTbody(tbody){
  if(!tbody) return;
  tbody.innerHTML = "";
}

function showNotice(){
  let notice = document.getElementById("notice");
  notice.style.display = "block";
  notice.innerHTML = "Copied";
  setTimeout(function(){
    notice.style.display = "none";
  }, 2000);
}

function renderTbody(tbody, datas){
  if(!tbody || !datas) return;

  for(key in datas){
    let data = datas[key];

    let tr = document.createElement("TR");
    let tdHost = document.createElement("TD"); tr.appendChild(tdHost);
    let tdIp = document.createElement("TD"); tr.appendChild(tdIp);
    let tdAccount = document.createElement("TD"); tr.appendChild(tdAccount);
    let tdNormalPasswd = document.createElement("TD"); tr.appendChild(tdNormalPasswd);
    let tdRootPasswd = document.createElement("TD"); tr.appendChild(tdRootPasswd);

    tdNormalPasswd.addEventListener("dblclick", function(){
        ncp.copy(data['normalPasswd']);
        showNotice();
    })

    tdRootPasswd.addEventListener("dblclick", function(){
        ncp.copy(data['rootPasswd']);
        showNotice();
    })

    tdHost.innerHTML = data['hostname'];
    tdIp.innerHTML = data['ip'];
    tdAccount.innerHTML = data['account'];
    tdNormalPasswd.innerHTML = data['normalPasswd'];
    tdRootPasswd.innerHTML = data['rootPasswd'];

    tbody.appendChild(tr);
  }
}
