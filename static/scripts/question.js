function userLogin() {
  window.open('login.html?redir=' + document.location.pathname + document.location.search + '#response-field',
    '_self');
}

function postVote(upvote, key, el) {
  let xhr = new XMLHttpRequest();
  let str = upvote ? "Upvote" : "Downvote";
  console.log(str, key);
  xhr.open("POST", '/question.html', true);
  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if(!(this.readyState === XMLHttpRequest.DONE && this.status === 200))
      return;
    if(this.response === "OK") {
      console.log(str, 'accepted', el.parentNode);
      let scoreBlock = el.parentNode;
      let scoreEl = scoreBlock.getElementsByClassName('score')[0];
      let otherButton = scoreBlock.getElementsByClassName(upvote ? 'downvote' : 'upvote')[0];
      if(otherButton.classList.contains('active-button')) {
        otherButton.classList.remove('active-button');
        scoreEl.innerHTML = parseInt(scoreEl.innerHTML) + (upvote ? 2 : -2);
        el.classList.add('active-button');
        return;
      }
      scoreEl.innerHTML = parseInt(scoreEl.innerHTML) + (upvote ? 1 : -1);
      el.classList.add('active-button');
    }
    else if(this.response === "Login") {
      window.open('/login.html?redir=/question.html' + document.location.search, '_self');
    }
    else if (this.response === "Ignored") {
      console.log(str, 'ignored');
    }
  }
  let query = upvote ? 'up' : 'down';
  xhr.send(document.location.search.slice(1) + "&" + query + "=" + key);
}

function downvote(key, el) {
  postVote(false, key, el); 
}

function upvote(key, el) {
  postVote(true, key, el); 
}

function addAnswer(el) {
  let answer = document.getElementById('new-answer').value.trim();
  if(!answer || answer === '')
    return;
  let date = new Date(Date.now()).toJSON();
  let pid = parseInt(document.location.search.split("QID=")[1]);
  let new_answer = {
    "OwnerUserId": null,
    "CreationDate": date,
    "ParentId": pid,
    "Score": 0,
    "Body": answer
  };
  console.log(new_answer);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", '/question.html', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if(!(this.readyState === XMLHttpRequest.DONE && this.status === 200))
      return;
    console.log(this.response);
    if(this.response === "OK") {
      console.log("New Answer added succesfully");
      window.location.reload();
    }
    else if(this.response === "Login") {
      window.open('/login.html?redir=/question.html' + document.location.search, '_self');
    }
  }
  xhr.send(JSON.stringify(new_answer));
}
function toggleSimilarQuestions() {
  let el = document.getElementById('similar-questions');
  if(el.style.left) {
    el.style.left = null;
    el.getElementsByTagName('img')[0].src = './assets/left-arrow.svg';
  }
  else {
    el.style.left = '90%';
    el.getElementsByTagName('img')[0].src = './assets/right-arrow.svg';
  }
}

function openQuestion(qid) {
  let params = 'QID=' + qid;
  open('/question.html?' + params, '_self');
}
