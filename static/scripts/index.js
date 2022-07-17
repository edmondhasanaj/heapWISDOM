"use strict";
function toggleQuestion(el) {
  el = el.parentNode.parentNode.querySelector('.question-body');
  let max_height = `${el.scrollHeight}px`;
  if(!el.style.maxHeight || el.style.maxHeight != max_height) {
    el.style.maxHeight = max_height;
  }
  else 
    el.style.maxHeight = 0;
}

function openQuestion(questionID) {
  let params = 'QID=' + questionID;
  open('/question.html?' + params, '_self');
}

window.onbeforeprint = beforePrint;
window.onafterprint = afterPrint;
