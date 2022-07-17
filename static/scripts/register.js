"use strict";
const unameFieldID = 'register-uname';
const pwdFieldID = 'register-pwd';

function redirectSignIn() {
  window.open('login.html' + document.location.search + document.location.hash, '_self');
}

function userRegister() {
  let usernameField = document.getElementById(unameFieldID);
  let passwordField = document.getElementById(pwdFieldID);
  let username = usernameField.value;
  let pwd = passwordField.value;
  if(!username) {
    blinkElement(usernameField);
    return;
  }
  if(!pwd) {
    blinkElement(passwordField);
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/register.html', true);
  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if(!(this.readyState === XMLHttpRequest.DONE && this.status === 200))
      return;
    if(this.response === "OK") {
      let query = document.location.search;
      let split = query.split('redir=');
      let newPage = 'index.html';
      if(split.length > 1) 
        newPage = split[1] + document.location.hash;
      window.open(newPage, '_self');
    }
    else if (this.response === "Failed") {
      let inputFields = document.getElementsByClassName('text-input');
      blinkElement(inputFields[0]);
      blinkElement(inputFields[1]);
    }
  }
  // We know it is unsafe to send the password in plain and
  // we would've preferred to store/check only salted hashes of pwds with
  // PBKDF2, but weren't sure if allowed to use that
  xhr.send("uname=" + username + "&pwd=" + pwd);
}

function blinkElement(element) {
  element.classList.toggle('wrong-input');
  let timeout = 200;
  setTimeout(() => {
    element.classList.toggle('wrong-input');
    setTimeout(() => {
      element.classList.toggle('wrong-input');
      setTimeout(() => {
        element.classList.toggle('wrong-input');
      },timeout);
    },timeout);
  }, timeout);
}
function addEnterEvent(element) {
  let usernameField = document.getElementById(unameFieldID);
  let passwordField = document.getElementById(pwdFieldID);

  usernameField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") 
        userRegister();
  });
  passwordField.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  
        userRegister();
    }
  });
}
if(document.getElementById(unameFieldID))
  addEnterEvent();
