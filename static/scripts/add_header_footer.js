async function loadData () {
  let rawData = await Promise.all([fetch('header.html'), fetch('footer.html')]);
  let data = await Promise.all([rawData[0].text(), rawData[1].text()]);
  // Add favicon
  let faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = "image/x-icon";
  faviconLink.href = './assets/favicon.ico';
  document.head.appendChild(faviconLink);
  // Insert header
  let headerStyle = document.createElement('link');
  headerStyle.rel = 'stylesheet';
  headerStyle.href = './style/header.css';
  document.head.appendChild(headerStyle);
  document.querySelector("header").innerHTML = data[0];
  let headerScript = document.createElement('script');
  headerScript.type = "text/javascript";
  headerScript.src = "./scripts/header.js";
  document.body.appendChild(headerScript);
  // Insert footer 
  let footerStyle = document.createElement('link');
  footerStyle.rel = 'stylesheet';
  footerStyle.href = './style/footer.css';
  document.head.appendChild(footerStyle);
  let footerScript = document.createElement('script');
  footerScript.type = "text/javascript";
  footerScript.src = "./scripts/footer.js";
  document.body.appendChild(footerScript);
  document.querySelector("footer").innerHTML = data[1];
}

loadData();

function test() {
  console.log("log");
}
