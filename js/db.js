const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
const iconv = require('iconv-lite');
const buffer = require('buffer').Buffer;
const path = require('path')
const databaseFilename = "database.json"
const charset = "cp949";
var database = [];

function getDbFilename(){
  return path.join(__dirname, databaseFilename);
}

function loadFromDatabaseFile(){
  let dbFile = getDbFilename();

  fs.readFile(dbFile, (err, buf) => {
      if(err){ return; }

      let data = iconv.decode(buf, charset);
      database = JSON.parse(data);
  });
}

function saveToDatabaseFile(database){
  let dbFile = getDbFilename();

  fs.writeFile(dbFile, JSON.stringify(database), {}, (err)=>{
      if(err){ // Error occur
        console.log(err);
      }
  });
}

function saveToDatabase(datas, header){
  let tDatabase = [];

  if(!datas || datas.length < 2){
    database = tDatabase;
    saveToDatabaseFile(tDatabase);
    return;
  }

  for(var i = 1; i < datas.length ; i++){
    let data = datas[i].split(",");
    let item = {};
    item["hostname"] = data[header["hostname"]]; if(!item["hostname"] || item["hostname"].length < 1) continue;
    item["ip"] = data[header["ip"]];
    item["account"] = data[header["account"]];
    item["normalPasswd"] = data[header["normalPasswd"]];
    item["rootPasswd"] = data[header["rootPasswd"]];
    item["key"] = item["hostname"].toLowerCase();
    tDatabase.push(item);
  }
  database = tDatabase;
  saveToDatabaseFile(tDatabase);
}

function getHeader(datas){
  var ret = {};
  if(!datas || datas.length < 1) return ret;

  let headLineArray = datas[0].split(",");

  for(let i in headLineArray){
    let item = headLineArray[i].trim();

    if(item == "자산명"){
      ret["hostname"] = i;
    } else if(item == "IP"){
      ret["ip"] = i;
    } else if(item == "계정"){
      ret["account"] = i;
    } else if(item == "일반계정"){
      ret["normalPasswd"] = i;
    } else if(item == "root"){
      ret["rootPasswd"] = i;
    }
  }
  return ret;
}

exports.updateDB = function(filepath, done){
  fs.stat(filepath, function(err, stats){
    if(err){
      if(done) done("update failed! : "+err);
      return;
    }

    if(stats.size > 100000000){
      if(done) done("update failed! (size limit over:"+stats.size+")");
      return;
    }

    fs.readFile(filepath, (err, buf) => {
        if(err){
            if(done) done("update failed! (file read error:"+err+")");
            return;
        }

        let data = iconv.decode(buf, charset);
        let aol = data.match(/[^\r\n]+/g);
        let header = getHeader(aol);
        saveToDatabase(aol, header);
    });

    if(done) done("update done");
  });
}

exports.loadDB = function(){
  loadFromDatabaseFile();
}

exports.search = function(keyword){
  let result = [];
  let lowKeyword = keyword.toLowerCase();
  for(let i in database){
      let data = database[i];
      if(data["key"].search(lowKeyword) > -1){
        result.push(data);
      }
  }
  return result;
}
