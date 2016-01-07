"use strict";

var inquirer = require("inquirer");
var questions = [
  {
    type: "input",
    name: "first_name",
    label: "名前",
    message: "名前を入力して下さい"
  },
  {
    type: "input",
    name: "last_name",
    label: "苗字",
    message: "苗字を入力して下さい",
    default: function () { return "Doe"; }
  },
  {
    type: "input",
    name: "age",
    label: "年齢",
    message: "年齢を入力して下さい"
  }
];
var answers = {};

function showList(){
  var choices = questions.map(function(item){
    var data = answers[item.name];
    var inputed = "[未入力] ";
    
    if(data){
      inputed = "[" + data + "]"
    }
    
    return {
      name: item.label + inputed,
      value: item.name
    };
  })
  
  inquirer.prompt([
    {
      type: "list",
      name: "form",
      message: "編集項目を選択して下さい",
      choices: choices.concat([new inquirer.Separator(),"入力終了"])
    }
  ], function( result ) {
    if(result.form === "入力終了"){
      console.log( JSON.stringify(answers, null, "  ") );
      return;
    }
    
    var q = questions.filter(function(item){
      return item.name === result.form;
    });
    prompt(q, function(result){
      var key = Object.keys(result)[0];
      answers[key] = result[key];
      showList();
    });
  });
}


function prompt(choise, cb){
  inquirer.prompt( choise, cb );
}


showList();
