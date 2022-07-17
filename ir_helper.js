function preprocess(originalString) {
  // Strip tags
  // Remove dot, commas
  // Remove special chars
  // Word stemming
  var pp = originalString.replace(/(<([^>]+)>)/ig, ' ')
    .replace(/[\.,-]/ig, ' ')
    .replace(/[\n`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/ig, '') //From stackoverflow`
    .replace(/(?=[a-z])((ies)|(y)|(ed)|(ing)|(s))(?=\s|$)/ig, '')
    .replace(/ +/ig, " ")
    .toLowerCase();
  return pp;
}

function embeddings(model, cleanedString) {
  // Convert a cleaned string to an embedding representation using a pretrained model
  // E.g., by averaging the word embeddings
  let words = cleanedString.split(/\s+/i);
  if(words[words.length - 1] == '')
  {
    words.splice(words.length - 1, 1);
  }

  let w_values = model.getVectors(words);
  if(w_values.length == 0)
  {
    return null;
  }

  let output_size = model.size;
  let output = v_init(output_size, 0);
  for(let w_val of w_values)
  {
    output = v_add(w_val.values, output);
  }

  output = v_div(output, w_values.length);
  return output;
}

function v_add(a, b) {
  return a.map((e, i) => e + b[i]);
}

function v_div(a, b) {
  return a.map((e, i) => e / b);
}

function v_init(size, val) {
  var a = [];
  for (let i = 0; i < size; i++) {
    a.push(val);
  }

  return a;
}

module.exports = { preprocess, embeddings, v_add, v_div, v_init };
