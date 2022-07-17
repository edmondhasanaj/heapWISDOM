"use strict";

function toggleFooter(event) {
  let path = document.getElementById('footer-path');
  let footerContainer = document.getElementById('footer-container');

  if(event.type === 'mouseenter') {
    path.style.d = 'path("M0,0L0,3.476C0,3.476 16.845,7.021 49.915,7.021C49.915,7.021 49.915,7.021 49.915,7.021C82.985,7.021 100,3.476 100,3.476L100,0L0,0")';
    footerContainer.style.height = "100%";
    return;
  }
  path.style.d = null;
  footerContainer.style.height = null;
}

document.getElementById('footer-path').addEventListener('mouseenter', e => toggleFooter(e));
document.getElementById('footer-container').addEventListener('mouseenter', e => toggleFooter(e));
document.getElementById('footer-path').addEventListener('mouseleave', e => toggleFooter(e));
document.getElementById('footer-container').addEventListener('mouseleave', e => toggleFooter(e));

