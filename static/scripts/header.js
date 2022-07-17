"use strict";

function userLogout() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", '/logout', true);
  xhr.onreadystatechange = function() { // Call a function when the state changes.
    if(!(this.readyState === XMLHttpRequest.DONE && this.status === 200))
      return;
    if(this.response === "OK")
      window.open('index.html', '_self');
  }
  xhr.send();
}

function modifyHeader() {
  let scrollY = window.pageYOffset || 0;
  let svg = document.getElementById('header-svg');
  let path = svg.getElementsByTagName('path')[0];
  let logo = document.getElementById('header-logo');
  let wisdom = document.getElementById('wisdom');
  let headerLogoText = document.getElementById('header-logo-text');
  let headerCenter = document.getElementById('header-center');
  let searchBox = document.querySelector('.search-bar');

  if (scrollY < 30) {
    path.style.d = null;
    logo.style.visibility = null;
    wisdom.style.visibility = null;
    headerLogoText.style.top = null;
    headerCenter.style.top = null;
    searchBox.style.border = '2px solid var(--darker)';
    let Ps = document.getElementsByClassName('header-p-light');
    while(Ps.length) {
      if(!Ps[0].classList.contains('header-p'))
        Ps[0].classList.add('header-p');
      if(Ps[0].classList.contains('header-p-light'))
        Ps[0].classList.remove('header-p-light');
    }
    return;
  }
  path.style.d = 'path("M0,0L0,3.476C0,3.476 18.018,6.564 27.125,7.021C38.912,7.612 53.684,8.015 70.722,7.021C84.496,6.217 100,3.476 100,3.476L100,0L0,0")';
  //path.style.d = 'path("M0,0L0,3.476C0,3.476 16.449,7.651 50,7.651C50,7.651 50,7.651 50,7.651C83.381,7.651 100,3.476 100,3.476L100,0L0,0")';
  logo.style.visibility = 'hidden';
  wisdom.style.visibility = 'hidden';
  headerLogoText.style.top = '-1em';
  headerCenter.style.top = '-1em';
  searchBox.style.border = '2px solid white';
  let Ps = document.getElementsByClassName('header-p');
  while(Ps.length) {
    if(!Ps[0].classList.contains('header-p-light'))
      Ps[0].classList.add('header-p-light');
    if(Ps[0].classList.contains('header-p'))
      Ps[0].classList.remove('header-p');
  }
}

function performSearch() {
  let query = document.getElementById('search-content').value.trim();
  window.open('/index.html?q=' + encodeURIComponent(query), "_self");
}

document.addEventListener('scroll', modifyHeader);
modifyHeader();

document.getElementById('search-content').addEventListener('keypress', (e) => {
  if(e.key === "Enter")
    performSearch();
});
