"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');
const ir_helper = require('./ir_helper.js');

function createCorpus(inputFile, outputFile, isQuestion = True) {
  console.log("[+] Loading " + inputFile);
  let inputText = fs.readFileSync(inputFile);
  console.log("[+] Loaded " + inputFile);
  let input = JSON.parse(inputText);
  console.log("[+] Parsed " + inputFile);

  for (const [key, value] of Object.entries(input)) {
    let doc = value;
    let body = ir_helper.preprocess(doc.Body);
    let doc_corpus = body;

    if (isQuestion) {
      let title = ir_helper.preprocess(doc.Title);
      doc_corpus = title + " " + body;
    }

    doc_corpus += "\n";

    try {
      fs.appendFileSync(outputFile, doc_corpus);
    }
    catch (err) {
      console.log(err);
    };
  }

  // Create a corpus from the input file
  // Preprocess the strings
  // Write to the output file
}

function createEmbeddings(inputFile, modelFile, outputFile, isQuestion = true) {
  // Create the document embeddings using the pretrained model
  // Save them for lookup of the running server

  console.log("[+] Loading " + inputFile);
  let inputText = fs.readFileSync(inputFile);
  console.log("[+] Loaded " + inputFile);
  let input = JSON.parse(inputText);
  console.log("[+] Parsed " + inputFile);

  w2v.loadModel(modelFile, function(err, model)
  {
    console.log("[+] Loaded w2v model");

    let totalDocs = Object.keys(input).length;
    console.log("[+] Total of " + totalDocs + " to be processed...")

    let docCounter = 0.0;
    let allDocs = new Map();
    for (const [key, value] of Object.entries(input)) 
    {
      let doc = value;
      let body = ir_helper.preprocess(doc.Body);
      let doc_corpus = body;
    
      if (isQuestion) {
        let title = ir_helper.preprocess(doc.Title);
        doc_corpus = title + " " + body;
      }
      
      let output = ir_helper.embeddings(model, doc_corpus);
      if(output !== null)
      {
        allDocs.set(key, output);
      }

      docCounter += 1.0;
      let prog = "Progress: " + ((docCounter / totalDocs) * 100.0).toFixed(2) + "%";
      process.stdout.write(`\r${prog}`);

      //Development
      if(docCounter > totalDocs)
      {
        break;
      }
    }

    console.log("[+] The embedding file " + outputFile + " has " + allDocs.size + " documents");
    let outputContent = allDocs.size + " " + model.size + "\n";
    for(const [docID, docValues] of allDocs)
    {
      outputContent += docID + " ";

      for(const val of docValues)
      {
        outputContent += val + " ";
      }

      outputContent += "\n";
    }

    try 
    {
      fs.writeFileSync(outputFile, outputContent);
    }
    catch (err) {
      console.log(err);
    };

    console.log("[+] The embeddings file " + outputFile + " finished writing");
  });
}

// - create a corpus with all the questions and answers
console.log("[+] Creating Corpus from Q&A");
fs.writeFileSync("data/corpus.txt", "");
createCorpus("data/Questions.json", 'data/corpus.txt', true);
createCorpus("data/Answers.json", 'data/corpus.txt', false);

// - build w2v model (i.e., word vectors)
console.log("[+] Creating word vectors from corpus...");
w2v.word2vec("data/corpus.txt", "data/word_vectors.txt", {}, function(code)
{
  // - create document embeddings for questions and answers
  console.log("[+] Creating document embeddings for Answers.json...");
  createEmbeddings("data/Answers.json", "data/word_vectors.txt", "data/entities.txt", false);
  console.log("[+] Creating document embeddings for Questions.json...");
  createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt", true);
});
