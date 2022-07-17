//
// Web Technology WS21
//
// Website nodeJS server
//
// Authors: Simone Franza  01530693
//          Edmond Hasanaj 11906810
//

"use strict";

const express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session')
const fs = require('fs');
const { toString } = require('body-parser');
const fsPromises = fs.promises;
const app = express();
const ir_helper = require("./ir_helper.js");
const w2v = require('word2vec');
const port = 3000;
let w2v_model = null;
let a_model = null;
let q_model = null;

// Part 1
// For part one, we just serve the static files and a dummy endpoint to fetch data
async function serverStartup() {
  console.log("[+] Loading all models...");

  await Promise.all([w2v.loadModel("data/word_vectors.txt", function(err, model)
    {
      w2v_model = model;
      console.log("[+] Loaded w2v Model...");
    }),
    w2v.loadModel("data/entities.txt", function(err, model)
    {
      a_model = model;
      console.log("[+] Loaded Answers Model...");
    }),
    w2v.loadModel("data/qentities.txt", function(err, model)
    {
      q_model = model;
      console.log("[+] Loaded Questions Model...");
    })]).then(() => 
      app.listen(port, () => {
        console.log(`heapWISDOM server listening at http://localhost:${port}`);
      })
    );
}
serverStartup();

async function reloadQuestionsModel()
{
  q_model = null;
  await w2v.loadModel("data/qentities.txt", function(err, model)
  {
    q_model = model;
    console.log("[+] Loaded Questions Model...");
  });
}

async function reloadAnswersModel()
{
  a_model = null;
  await w2v.loadModel("data/entities.txt", function(err, model)
  {
    a_model = model;
    console.log("[+] Loaded Answers Model...");
  });
}

app.all('assets/*', function (req,res, next) {
   res.status(403).send({
      message: 'Access Forbidden'
   });
});


// Parse json in POST requests
app.use(bodyParser.urlencoded({ extended: false }));
// Use EJS for the templates
app.set('view engine', 'ejs');
// Setup express-session
let cookieAge = 1000 * 60 * 60 * 24; // 1 Day
app.use(session({
  cookie : { maxAge: cookieAge},
  resave : false,
  secret : '0xDEADBEEF',
  saveUninitialized: false
}));
app.use(express.json());

let topWaves = [
  "M0 135L16 131.7C32 128.3 64 121.7 96 122.5C128 123.3 160 131.7 192 124C224 116.3 256 92.7 288 92.2C320 91.7 352 114.3 384 123.3C416 132.3 448 127.7 480 121.2C512 114.7 544 106.3 576 94.7C608 83 640 68 672 66.5C704 65 736 77 768 77.2C800 77.3 832 65.7 864 62.2C896 58.7 928 63.3 960 77.3C992 91.3 1024 114.7 1056 113.3C1088 112 1120 86 1152 85.5C1184 85 1216 110 1248 110.2C1280 110.3 1312 85.7 1344 78.7C1376 71.7 1408 82.3 1424 87.7L1440 93L1440 186L1424 186C1408 186 1376 186 1344 186C1312 186 1280 186 1248 186C1216 186 1184 186 1152 186C1120 186 1088 186 1056 186C1024 186 992 186 960 186C928 186 896 186 864 186C832 186 800 186 768 186C736 186 704 186 672 186C640 186 608 186 576 186C544 186 512 186 480 186C448 186 416 186 384 186C352 186 320 186 288 186C256 186 224 186 192 186C160 186 128 186 96 186C64 186 32 186 16 186L0 186Z",
  "M0 156L16 133C32 110 64 64 96 64.7C128 65.3 160 112.7 192 135.5C224 158.3 256 156.7 288 137.3C320 118 352 81 384 71.3C416 61.7 448 79.3 480 89.3C512 99.3 544 101.7 576 110.5C608 119.3 640 134.7 672 126.2C704 117.7 736 85.3 768 74.3C800 63.3 832 73.7 864 80.3C896 87 928 90 960 79.2C992 68.3 1024 43.7 1056 52.3C1088 61 1120 103 1152 125.5C1184 148 1216 151 1248 135.5C1280 120 1312 86 1344 66.7C1376 47.3 1408 42.7 1424 40.3L1440 38L1440 186L1424 186C1408 186 1376 186 1344 186C1312 186 1280 186 1248 186C1216 186 1184 186 1152 186C1120 186 1088 186 1056 186C1024 186 992 186 960 186C928 186 896 186 864 186C832 186 800 186 768 186C736 186 704 186 672 186C640 186 608 186 576 186C544 186 512 186 480 186C448 186 416 186 384 186C352 186 320 186 288 186C256 186 224 186 192 186C160 186 128 186 96 186C64 186 32 186 16 186L0 186Z",
  "M0 62L26.7 71.3C53.3 80.7 106.7 99.3 160 92.3C213.3 85.3 266.7 52.7 320 51.2C373.3 49.7 426.7 79.3 480 104.2C533.3 129 586.7 149 640 161.5C693.3 174 746.7 179 800 164.2C853.3 149.3 906.7 114.7 960 85C1013.3 55.3 1066.7 30.7 1120 23.3C1173.3 16 1226.7 26 1280 45.5C1333.3 65 1386.7 94 1413.3 108.5L1440 123L1440 186L1413.3 186C1386.7 186 1333.3 186 1280 186C1226.7 186 1173.3 186 1120 186C1066.7 186 1013.3 186 960 186C906.7 186 853.3 186 800 186C746.7 186 693.3 186 640 186C586.7 186 533.3 186 480 186C426.7 186 373.3 186 320 186C266.7 186 213.3 186 160 186C106.7 186 53.3 186 26.7 186L0 186Z",
  "M0 162L15 146.8C30 131.7 60 101.3 90 93.8C120 86.3 150 101.7 180 116.8C210 132 240 147 270 151.2C300 155.3 330 148.7 360 126.5C390 104.3 420 66.7 450 45C480 23.3 510 17.7 540 35.3C570 53 600 94 630 103.5C660 113 690 91 720 78C750 65 780 61 810 60.3C840 59.7 870 62.3 900 81C930 99.7 960 134.3 990 153.2C1020 172 1050 175 1080 162C1110 149 1140 120 1170 90.3C1200 60.7 1230 30.3 1260 35.2C1290 40 1320 80 1350 104.3C1380 128.7 1410 137.3 1425 141.7L1440 146L1440 186L1425 186C1410 186 1380 186 1350 186C1320 186 1290 186 1260 186C1230 186 1200 186 1170 186C1140 186 1110 186 1080 186C1050 186 1020 186 990 186C960 186 930 186 900 186C870 186 840 186 810 186C780 186 750 186 720 186C690 186 660 186 630 186C600 186 570 186 540 186C510 186 480 186 450 186C420 186 390 186 360 186C330 186 300 186 270 186C240 186 210 186 180 186C150 186 120 186 90 186C60 186 30 186 15 186L0 186Z",
  "M0 75L15 92C30 109 60 143 90 138.3C120 133.7 150 90.3 180 80C210 69.7 240 92.3 270 113.2C300 134 330 153 360 142.2C390 131.3 420 90.7 450 82.7C480 74.7 510 99.3 540 93.3C570 87.3 600 50.7 630 39C660 27.3 690 40.7 720 62C750 83.3 780 112.7 810 115.7C840 118.7 870 95.3 900 75.8C930 56.3 960 40.7 990 46.2C1020 51.7 1050 78.3 1080 82.2C1110 86 1140 67 1170 79.7C1200 92.3 1230 136.7 1260 154.3C1290 172 1320 163 1350 147.7C1380 132.3 1410 110.7 1425 99.8L1440 89L1440 186L1425 186C1410 186 1380 186 1350 186C1320 186 1290 186 1260 186C1230 186 1200 186 1170 186C1140 186 1110 186 1080 186C1050 186 1020 186 990 186C960 186 930 186 900 186C870 186 840 186 810 186C780 186 750 186 720 186C690 186 660 186 630 186C600 186 570 186 540 186C510 186 480 186 450 186C420 186 390 186 360 186C330 186 300 186 270 186C240 186 210 186 180 186C150 186 120 186 90 186C60 186 30 186 15 186L0 186Z"];
let bottomWaves = [
  "M0 154L15 141.8C30 129.7 60 105.3 90 107.8C120 110.3 150 139.7 180 132.2C210 124.7 240 80.3 270 54.3C300 28.3 330 20.7 360 30.2C390 39.7 420 66.3 450 90.7C480 115 510 137 540 140.2C570 143.3 600 127.7 630 106.2C660 84.7 690 57.3 720 54.8C750 52.3 780 74.7 810 88.2C840 101.7 870 106.3 900 118.8C930 131.3 960 151.7 990 156.3C1020 161 1050 150 1080 142.7C1110 135.3 1140 131.7 1170 126C1200 120.3 1230 112.7 1260 110.8C1290 109 1320 113 1350 108.7C1380 104.3 1410 91.7 1425 85.3L1440 79L1440 0L1425 0C1410 0 1380 0 1350 0C1320 0 1290 0 1260 0C1230 0 1200 0 1170 0C1140 0 1110 0 1080 0C1050 0 1020 0 990 0C960 0 930 0 900 0C870 0 840 0 810 0C780 0 750 0 720 0C690 0 660 0 630 0C600 0 570 0 540 0C510 0 480 0 450 0C420 0 390 0 360 0C330 0 300 0 270 0C240 0 210 0 180 0C150 0 120 0 90 0C60 0 30 0 15 0L0 0Z",
  "M0 62L15 70.8C30 79.7 60 97.3 90 89.3C120 81.3 150 47.7 180 41.7C210 35.7 240 57.3 270 80.3C300 103.3 330 127.7 360 135.8C390 144 420 136 450 130C480 124 510 120 540 114.2C570 108.3 600 100.7 630 95.5C660 90.3 690 87.7 720 101.3C750 115 780 145 810 154.2C840 163.3 870 151.7 900 141.2C930 130.7 960 121.3 990 101.3C1020 81.3 1050 50.7 1080 58.5C1110 66.3 1140 112.7 1170 117.8C1200 123 1230 87 1260 83.8C1290 80.7 1320 110.3 1350 116.5C1380 122.7 1410 105.3 1425 96.7L1440 88L1440 0L1425 0C1410 0 1380 0 1350 0C1320 0 1290 0 1260 0C1230 0 1200 0 1170 0C1140 0 1110 0 1080 0C1050 0 1020 0 990 0C960 0 930 0 900 0C870 0 840 0 810 0C780 0 750 0 720 0C690 0 660 0 630 0C600 0 570 0 540 0C510 0 480 0 450 0C420 0 390 0 360 0C330 0 300 0 270 0C240 0 210 0 180 0C150 0 120 0 90 0C60 0 30 0 15 0L0 0Z",
  "M0 35L15 59C30 83 60 131 90 145.2C120 159.3 150 139.7 180 111.7C210 83.7 240 47.3 270 49C300 50.7 330 90.3 360 108.3C390 126.3 420 122.7 450 101.5C480 80.3 510 41.7 540 32.2C570 22.7 600 42.3 630 57C660 71.7 690 81.3 720 88.5C750 95.7 780 100.3 810 105.7C840 111 870 117 900 114.8C930 112.7 960 102.3 990 111.5C1020 120.7 1050 149.3 1080 145.5C1110 141.7 1140 105.3 1170 91.3C1200 77.3 1230 85.7 1260 80.5C1290 75.3 1320 56.7 1350 67.7C1380 78.7 1410 119.3 1425 139.7L1440 160L1440 0L1425 0C1410 0 1380 0 1350 0C1320 0 1290 0 1260 0C1230 0 1200 0 1170 0C1140 0 1110 0 1080 0C1050 0 1020 0 990 0C960 0 930 0 900 0C870 0 840 0 810 0C780 0 750 0 720 0C690 0 660 0 630 0C600 0 570 0 540 0C510 0 480 0 450 0C420 0 390 0 360 0C330 0 300 0 270 0C240 0 210 0 180 0C150 0 120 0 90 0C60 0 30 0 15 0L0 0Z",
  "M0 35L21.8 44.3C43.7 53.7 87.3 72.3 131 80C174.7 87.7 218.3 84.3 262 69.3C305.7 54.3 349.3 27.7 393 31.8C436.7 36 480.3 71 524 75.2C567.7 79.3 611.3 52.7 654.8 52.7C698.3 52.7 741.7 79.3 785.2 81.5C828.7 83.7 872.3 61.3 916 58.2C959.7 55 1003.3 71 1047 72.3C1090.7 73.7 1134.3 60.3 1178 47C1221.7 33.7 1265.3 20.3 1309 17C1352.7 13.7 1396.3 20.3 1418.2 23.7L1440 27L1440 0L1418.2 0C1396.3 0 1352.7 0 1309 0C1265.3 0 1221.7 0 1178 0C1134.3 0 1090.7 0 1047 0C1003.3 0 959.7 0 916 0C872.3 0 828.7 0 785.2 0C741.7 0 698.3 0 654.8 0C611.3 0 567.7 0 524 0C480.3 0 436.7 0 393 0C349.3 0 305.7 0 262 0C218.3 0 174.7 0 131 0C87.3 0 43.7 0 21.8 0L0 0Z",
  "M0 83L21.8 74C43.7 65 87.3 47 131 35.2C174.7 23.3 218.3 17.7 262 25.5C305.7 33.3 349.3 54.7 393 54.7C436.7 54.7 480.3 33.3 524 28.5C567.7 23.7 611.3 35.3 654.8 48.5C698.3 61.7 741.7 76.3 785.2 73C828.7 69.7 872.3 48.3 916 51.3C959.7 54.3 1003.3 81.7 1047 91.5C1090.7 101.3 1134.3 93.7 1178 82.7C1221.7 71.7 1265.3 57.3 1309 43C1352.7 28.7 1396.3 14.3 1418.2 7.2L1440 0L1440 0L1418.2 0C1396.3 0 1352.7 0 1309 0C1265.3 0 1221.7 0 1178 0C1134.3 0 1090.7 0 1047 0C1003.3 0 959.7 0 916 0C872.3 0 828.7 0 785.2 0C741.7 0 698.3 0 654.8 0C611.3 0 567.7 0 524 0C480.3 0 436.7 0 393 0C349.3 0 305.7 0 262 0C218.3 0 174.7 0 131 0C87.3 0 43.7 0 21.8 0L0 0Z"];

function findMostPopularQuestions(questions, numQuestions) {
  let keys = Object.keys(questions);
  let foundKeys = [];
  if(numQuestions > keys.length) {
    for(let i = 0; i < keys.length; i++)
      foundKeys.push(keys[i]);
    foundKeys.sort((a, b) => questions[a]['Score'] < questions[b]['Score'] ? 1 : -1);
    return foundKeys;
  }
  for(let i = 0; i < keys.length; i++) {
    foundKeys.push(keys[i]);
  }
  foundKeys.sort((a, b) => questions[a]['Score'] < questions[b]['Score'] ? 1 : -1);
  return foundKeys.slice(0, numQuestions);
}

function getIndexData(num_questions) {
  if(!num_questions)
    return '';
  let rawQuestions = fs.readFileSync('./data/Questions.json');
  let questionsJSON = JSON.parse(rawQuestions);
  let keys = findMostPopularQuestions(questionsJSON, num_questions);
  let data = keys.map((key) => questionsJSON[key]);
  return {keys: keys, data: data};
}

function getWisdom() {
  let rawWisdom = fs.readFileSync('./data/wisdoms.json');
  let wisdoms = JSON.parse(rawWisdom).wisdoms;
  return wisdoms[Math.floor(Math.random() * wisdoms.length)].phrase;
}

// I would've preferred to store/check only salted hashes of pwd with
// PBKDF2, but wasn't sure if allowed to use that
app.post('/login.html', (req, res) => {
  console.log("[+] New login")
  console.log({username: req.body.uname, password: req.body.pwd});
  let rawUsers = fs.readFileSync('./data/users.json');
  let usersDB = JSON.parse(rawUsers).users;
  let found = false;
  let uid = -1;
  for(let i = 0; i < usersDB.length; i++) {
    if(usersDB[i].uname !== req.body.uname)
      continue;
    found = usersDB[i].pwd === req.body.pwd;
    uid = usersDB[i].UID;
    break;
  }
  if(!found) {
    res.status(200).send('Failed');
    console.log("[-] Failed");
    return;
  }
  if(!req.session.userdata)
    req.session.userdata = {};
  req.session.userdata.loggedIn = true;
  req.session.userdata.username = req.body.uname;
  req.session.userdata.UID = uid;
  res.status(200).send('OK');
  console.log("[+] Success");
});


app.post('/register.html', (req, res) => {
  console.log("[+] Register new user")
  console.log({username: req.body.uname, password: req.body.pwd});
  let rawUsers = fs.readFileSync('./data/users.json', "utf-8");
  let parsedUsers = JSON.parse(rawUsers);
  let usersDB = parsedUsers.users;
  let found = false;
  let uid = -1;
  for(let i = 0; i < usersDB.length; i++) {
    if(usersDB[i].uname === req.body.uname) {
      found = 1;
      uid = usersDB[i].UID;
      break;
    }
  }
  // Username exists
  if(found) {
    res.status(200).send('Failed');
    console.log("[-] Failed");
    return;
  }
  let newUID = usersDB[usersDB.length - 1].UID + 1;
  parsedUsers.users.push({"UID" : newUID, "uname" : req.body.uname, "pwd" : req.body.pwd});
  fs.writeFileSync("./data/users.json",JSON.stringify(parsedUsers, null, " "), "utf-8");
  if(!req.session.userdata)
    req.session.userdata = {};
  req.session.userdata.loggedIn = true;
  req.session.userdata.username = req.body.uname;
  req.session.userdata.UID = uid;
  res.status(200).send('OK');
  console.log("[+] Success");
});

app.post('/logout', (req, res) => {
  if(!req.session.userdata || !req.session.userdata.loggedIn)
    return;
  console.log("[+] Logout");
  req.session.regenerate(() => console.log("[+] Session regenerated"));
  res.status(200).send('OK');
});

function handleUpDownVote(req, res) {
  let value = req.body.up ? 1 : -1;
  let multiplier = 1;
  let str = req.body.up ? "Up" : "Down";

  let idx = req.body.up ? req.body.up : req.body.down;
  let rawRatings = fs.readFileSync('./data/ratings.json');
  let ratings = JSON.parse(rawRatings);
  if(!(idx in ratings))
    ratings[idx] = {};
  if(ratings[idx][req.session.userdata.UID] === value) {
    console.log("[-] Ignored: vote is already present");
    return res.status(200).send("Ignored");
  }
  if(ratings[idx][req.session.userdata.UID])
    multiplier = 2;

  ratings[idx][req.session.userdata.UID] = value;
  // If idx== qid then its question otherwise answer
  if(req.body.QID === idx) {
    let rawQuestions = fs.readFileSync('./data/Questions.json', "utf-8");
    let parsedQuestions = JSON.parse(rawQuestions);
    if(!req.body.QID in parsedQuestions) {
      console.log("[-] Ignored: question not present");
      return res.status(200).send("Ignored");
    }
    console.log("[+] " + str + "voting question", idx)
    parsedQuestions[idx].Score += multiplier * value;
    res.status(200).send("OK");
    fs.writeFileSync("./data/ratings.json",JSON.stringify(ratings, null, " "), "utf-8");
    fs.writeFileSync("./data/Questions.json",JSON.stringify(parsedQuestions, null, " "), "utf-8");
    return;
  }
  let rawAnswers = fs.readFileSync('./data/Answers.json', "utf-8");
  let parsedAnswers = JSON.parse(rawAnswers);
  if(!idx in parsedAnswers) {
    console.log("[-] Ignored: answer not present");
    return res.status(200).send("Ignored");
  }
  console.log("[+] " + str + "voting answer", idx)
  parsedAnswers[idx].Score += multiplier * value;
  res.status(200).send("OK");
  fs.writeFileSync("./data/ratings.json",JSON.stringify(ratings, null, " "), "utf-8");
  fs.writeFileSync("./data/Answers.json",JSON.stringify(parsedAnswers, null, " "), "utf-8");
  return;
}

async function updateEmbeddings(filename, buffer) {
  let fp = await fsPromises.open(filename, 'r+');
  let stats = fs.statSync(filename);
  let size = stats.size;
  let res = await fp.read({length: 100});
  let pos = 0;
  let strs = ['', ''];
  let writeTo = 0;
  while(res.buffer[pos] !== '\n'.charCodeAt(0)) {
    if(res.buffer[pos] === ' '.charCodeAt(0)) {
      writeTo = 1;
      pos++;
      continue;
    }
    strs[writeTo] += String.fromCharCode(res.buffer[pos]);
    pos++;
  }
  let firstNum = parseInt(strs[0]) + 1;
  let firstBytesBefore = strs[0].length;
  let firstBytesAfter = firstNum.toString().length;
  if(firstBytesBefore === firstBytesAfter) {
    await fp.write(firstNum.toString(), 0);
    await fp.write(buffer + '\n', size);
    fp.close();
    return;
  }
  let rawData = fs.readFileSync(filename).slice(pos) + buffer + '\n';
  let firstLine = firstNum.toString() + ' ' + strs[1];
  await fp.write(firstLine, 0);
  await fp.write(rawData, firstLine.length);
  fp.close();
}

async function appendToJSONFile(filename, buffer) {
  let fp = await fsPromises.open(filename, 'r+');
  let stats = fs.statSync(filename)
  let size = stats.size;
  let numBrackets = 0;
  let pos = 0;
  while(numBrackets < 2) {
    let res = await fp.read({length: 1, position: size-pos});
    if(res.buffer[0] === "}".charCodeAt(0))
      numBrackets++;
    pos++;
  }
  pos -= 2;
  let newBuffer = Buffer.from(buffer + '\n}');
  await fp.write(newBuffer, 0, newBuffer.length, size - pos);
  fp.close();
}

function findNewID() {
  let rawAnswers = fs.readFileSync('./data/Answers.json');
  let parsedAnswers = JSON.parse(rawAnswers);
  let keys = Object.keys(parsedAnswers);
  let lastAID= parseInt(keys[keys.length - 1]);
  let rawQuestions = fs.readFileSync('./data/Questions.json');
  let parsedQuestions = JSON.parse(rawQuestions);
  keys = Object.keys(parsedQuestions);
  let lastQID = parseInt(keys[keys.length - 1]);
  return lastQID > lastAID ? lastQID + 1 : lastAID + 1;
}

function handleNewAnswer(req, res) {
  let answer = req.body;
  answer.OwnerUserId = req.session.userdata.UID;
  let newID = findNewID();
  let buffer = JSON.stringify(answer, null, " ");
  res.status(200).send("OK");
  appendToJSONFile('./data/Answers.json', `,\n    "${newID}": ${buffer}`);
  
  let body = ir_helper.preprocess(answer.Body);
  let output = ir_helper.embeddings(w2v_model, body);
  if(output !== null)
  {
    console.log("Writing embedding to entities.txt");
    let stringifyOutput = stringifyEmbedding(newID, output);
    
    updateEmbeddings("data/entities.txt", stringifyOutput)
    .then(() => {
      reloadAnswersModel();
    })
  }
}

function stringifyEmbedding(docID, embeddingVec)
{
  let outputContent = docID + " ";

  for(const val of embeddingVec)
  {
    outputContent += val + " ";
  }

  return outputContent;
}

app.post('/question.html', (req, res) => {
  console.log("[+] POST question, content type", req.headers['content-type']);
  if(!req.session.userdata || !req.session.userdata.loggedIn) {
    console.log("[-] User is not logged in");
    res.status(200).send('Login');
    return;
  }
  if(req.is('application/x-www-form-urlencoded') && (req.body.up || req.body.down))
    return handleUpDownVote(req, res);
  if(req.is('application/json'))
    return handleNewAnswer(req, res);
  res.status(200).send('Unknown request');
});

function handleNewQuestion(req, res) {
  let question = req.body;
  question.OwnerUserId = req.session.userdata.UID;
  let newID = findNewID();
  let buffer = JSON.stringify(question, null, " ");
  appendToJSONFile('./data/Questions.json', `,\n    "${newID}": ${buffer}`);
  res.status(200).send("OK=" + newID);

  let body = ir_helper.preprocess(question.Title) + " " + ir_helper.preprocess(question.Body);
  let output = ir_helper.embeddings(w2v_model, body);
  if(output !== null)
  {
    console.log("Writing embedding to qentities.txt");
    let stringifyOutput = stringifyEmbedding(newID, output);
    
    updateEmbeddings("data/qentities.txt", stringifyOutput)
    .then(() => {
      reloadQuestionsModel();
    })
  }
}

app.post('/new.html', (req, res) => {
  console.log("[+] POST new, content type", req.headers['content-type']);
  if(!req.session.userdata || !req.session.userdata.loggedIn) {
    console.log("[-] User is not logged in");
    res.status(200).send('Login');
    return;
  }
  if(req.is('application/json'))
    return handleNewQuestion(req, res);
  res.status(200).send('Unknown request');
});

function createSearchResults(keyData, query, req, res) {
  let rawQuestions = fs.readFileSync('./data/Questions.json', "utf-8");
  let rawAnswers = fs.readFileSync('./data/Answers.json', "utf-8");
  let questions = JSON.parse(rawQuestions);
  let answers = JSON.parse(rawAnswers);
  let data = keyData.map((key) => {
    if(key.word in questions)
      return questions[key.word];
    if(key.word in answers) {
      let obj = answers[key.word];
      obj.Title = questions[obj.ParentId].Title + ' (answer)';
      return obj;
    }
  });
  let keys = keyData.map((key) => {
    if(key.word in questions)
      return key.word;
    if(key.word in answers)
      return answers[key.word].ParentId;
  })
  res.render('index', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
    data : data,
    keys : keys,
    topWaves : topWaves,
    bottomWaves : bottomWaves,
    query: query
  });
}

app.get('/index.html?', (req, res) => {
  if(!req.query.q) {
    let indexData = getIndexData(10);
    res.render('index', {
      userdata : req.session.userdata,
      wisdom : getWisdom(),
      data : indexData.data,
      keys : indexData.keys,
      topWaves : topWaves,
      bottomWaves : bottomWaves,
      query: null 
    });
    return;
  }
  let query = decodeURIComponent(req.query.q);
  console.log("Query -" + query + "-");
  search(query, (searchResult) => createSearchResults(searchResult, query, req, res), 10);
});

app.get('/login.html', (req, res) => {
  res.render('login', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
  });
});

app.get('/register.html', (req, res) => {
  res.render('register', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
  });
});

app.get('/about.html', (req, res) => {
  res.render('about', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
  });
});

app.get('/new.html', (req, res) => {
  if(!req.session.userdata || !req.session.userdata.loggedIn) {
    res.redirect('login.html?redir=/new.html');
    return;
  }
  res.render('new', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
  });
});

function sendQuestionRender(res, userdata, wisdom, question, answers, similarKeys, allKeys) {
  let rawQuestions = fs.readFileSync('./data/Questions.json', "utf-8");
  let parsedQuestions = JSON.parse(rawQuestions);
  let similar = [];
  let keys = [];
  if(similarKeys) {
    for(let i = 0; i < similarKeys.length; i++) {
      if(!(similarKeys[i].word in parsedQuestions))
        continue;
      similar.push(parsedQuestions[similarKeys[i].word]);
      keys.push(similarKeys[i].word);
    }
  }
  res.render("question", {
    userdata : userdata,
    wisdom : wisdom,
    question: question,
    answers: answers,
    similar : similar,
    similarKeys: keys,
    IDs: allKeys 
  });
}

app.get('/question.html?', (req, res) => {
  if(!req.query || !req.query.QID) {
    res.status(404).render('404', {
      userdata : req.session.userdata,
      wisdom : getWisdom(),
    });
    return;
  }
  let qid = req.query.QID;
  console.log("[+] Requested question " + qid);

  let rawQuestions = fs.readFileSync('./data/Questions.json', "utf-8");
  let parsedQuestions = JSON.parse(rawQuestions);

  if(!(qid in parsedQuestions)) {
    res.status(404).render('404', {
      userdata : req.session.userdata,
      wisdom : getWisdom(),
    });
    return;
  }
  let question = parsedQuestions[qid];
  question.rated = null;
  let rawRatings = fs.readFileSync('./data/ratings.json');
  let ratings = JSON.parse(rawRatings);
  if(qid in ratings && req.session.userdata && req.session.userdata.UID in ratings[qid])
    question.rated = ratings[qid][req.session.userdata.UID];

  let rawAnswers = fs.readFileSync('./data/Answers.json', "utf-8");
  let parsedAnswers = JSON.parse(rawAnswers);
  let intQID = parseInt(qid);
  let keys = Object.keys(parsedAnswers);
  let newKeys = keys.filter(key => {
    return parsedAnswers[key].ParentId === intQID;
  });
  newKeys.sort((a, b) => parsedAnswers[a]['Score'] <= parsedAnswers[b]['Score'] ? 1 : -1);
  let answers = newKeys.map(key => { 
    let obj = parsedAnswers[key];
    obj.rated = null;
    if(key in ratings && req.session.userdata && req.session.userdata.UID in ratings[key])
      obj.rated = ratings[key][req.session.userdata.UID];
    return obj;});
  let allKeys = [qid, ...newKeys];
  similar_questions(qid, (similarKeys) => 
    sendQuestionRender(res, req.session.userdata, getWisdom(), question, answers, similarKeys, allKeys), 10);
});

app.use(express.static('static'));
app.use(express.static('data'));

app.get('/', (req, res) => {
  let indexData = getIndexData(10);
  res.render('index', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
    data : indexData.data,
    keys : indexData.keys,
    topWaves : topWaves,
    bottomWaves : bottomWaves,
    query: null
  });
});
app.get('', (req, res) => {
  let indexData = getIndexData(10);
  res.render('index', {
    userdata : req.session.userdata,
    wisdom : getWisdom(),
    data : indexData.data,
    keys : indexData.keys,
    topWaves : topWaves,
    bottomWaves : bottomWaves,
    query: null
  });
});

app.get('*', function(req, res){
  res.status(404).render('404', {
   userdata : req.session.userdata,
    wisdom : getWisdom(),
  });
});




// Part 2
// We create embeddings of the query and use it for a similarity search on the pretrained document embeddings

//app.get('/search', (req, res) => {
//  res.send('API for ' + req.query["query"]);
//});
//
//app.get('/sim/:qid', (req, res) => {
//  res.send('API for ' + req.params.qid);
//});
//
//Performs search through the questions and answers database.
//It returns a list of IDs of Questions or Answers, to which the query matches best
//The list of IDs will have a max size of #num_results and every element can be either a question or an answer.
//Callback is of type function(result)
function search(raw_query, callback, num_results)
{
  console.log("[+] Searching '" + raw_query + "'");
  let preprocessed = ir_helper.preprocess(raw_query);
  console.log("[+] Preprocessed query: " + preprocessed);
  wait_for_models().then(() => {
    let query_emb = ir_helper.embeddings(w2v_model, preprocessed);
    if(query_emb === null)
    {
      callback([]);
      return;
    }

    let q_results = q_model.getNearestWords(query_emb, num_results);
    let a_results = a_model.getNearestWords(query_emb, num_results);

    q_results = q_results.concat(a_results);
    q_results.sort((a, b) => b.dist - a.dist);
    q_results.splice(num_results);

    callback(q_results);
  });
}


//Given a current question ID (that the user is currently browsing), this
//will search and recommend some similar questions to this one. Returns a list of 
//Question IDs. Its size is max #num_results
//Callback is of type function(result)
function similar_questions(current_question_id, callback, num_results)
{
  wait_for_models().then(() => {
    let q_results = q_model.mostSimilar(current_question_id, num_results);
    callback(q_results);
  });
}

async function wait_for_models()
{
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      if (w2v_model !== null && a_model !== null && q_model !== null)
      {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}
