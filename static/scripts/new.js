"use strict";

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

function addQuestion(el) {
  let questionTitleEl = document.getElementById('question-title');
  let questionBodyEl = document.getElementById('question-body');
  let questionTitle = questionTitleEl.value.trim();
  let questionBody = questionBodyEl.value.trim();
  if(!questionTitle || questionTitle === '')
    return blinkElement(questionTitleEl);
  if(!questionBody || questionBody === '')
    return blinkElement(questionBodyEl);
  let date = new Date(Date.now()).toJSON();
  let pid = parseInt(document.location.search.split("QID=")[1]);

  let new_question = {
    "OwnerUserId": null,
    "CreationDate": date,
    "Score":0,
    "Title": questionTitle,
    "Body": questionBody,
  };
  console.log(new_question);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", '/new.html', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if(!(this.readyState === XMLHttpRequest.DONE && this.status === 200))
      return;
    console.log(this.response);
    if(this.response === "Login") {
      window.open('/login.html?redir=/question.html' + document.location.search, '_self');
    }
    else if(this.response.includes("OK")){
      console.log("New question added succesfully");
      window.open('/question.html?QID=' + this.response.split("OK=")[1], '_self');
    }
  }
  xhr.send(JSON.stringify(new_question));
}
