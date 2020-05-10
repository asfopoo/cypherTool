var readlineSync = require('readline-sync');
var mysql = require('mysql');
var async = require("async");

let quadGramCounts = [];


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "*************",
  database: "*************"
});

async function main () {


// Wait for user's response.
//var cipherText = readlineSync.question('Please enter the cipher text: ');
  let afterThousand = '';
  let cipherText = 'giuifgceiiprctpnnduceiqprcni';
  let cipherLength = cipherText.length;
  let quadLength = cipherLength - 3;

//shuffles the alphabet to try to guess the key  -- generates the first parent
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const shuffle = str => [...str].reduceRight((res, _, __, arr) => [...res, arr.splice(~~(Math.random() * arr.length), 1)[0]], []).join('');
  //let key = 'phqgiumeaylnofdxjkrcvstzwb';

  let key = shuffle(str);
  //console.log('key', key);
  let count = 0;
  let lowestFitness = {
    plainText: '',
    fitness: -999999999999999999999999.00        //set lowest fitness to negative infinity
  };

  /*let allQuadGrams = [];
  await getAllQuadCounts().then(response => {
    allQuadGrams = response;
  })*/

  let rand1 = Math.floor(Math.random() * 26) + 1;
  let rand2 = Math.floor(Math.random() * 26) + 1;
  let firstSwap = 0;


/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/
  while (count <= 1000) {
    let quadgrams = [];
    let quadCounts = [];
    let quadGramProbabilities = [];
    let quadGramLogs = [];
    let fitness = -999999999999999999999999.00;
//decipher the message
    //console.log('key before translation ', key)
    let plainText = ''; //conversion to plaintext variable
    for (let i = 0; i < cipherText.length; i++) {
      for (let k = 0; k < 26; k++) {  //loop through the key
        if (cipherText[i] === key[k]) {  // if location of the cipher = key => swap with corresponding substitution letter
          plainText += str[k];
        }
      }
    }

//seperate plaintext into quads
    for (let i = 0; i < plainText.length; i++) {
      if (plainText[i + 3]) { // if cipherText has 4 letters starting from position i
        let temp = plainText[i];
        temp += plainText[i + 1];
        temp += plainText[i + 2];
        temp += plainText[i + 3];
        quadgrams.push(temp);
      }
    }

//get counts of quadgrams
    await getQuadCounts(quadgrams).then(response => {
      quadCounts = response;
      //console.log('getQuadCounts Response ... Finallyyyyyyyyy', response);
      console.log('plaintext', plainText);
    });


//get probabalitiy of quadgram
    await convertCountsToProbs(quadCounts, quadLength).then(response => {
      //console.log('probs', response)
      quadGramProbabilities = response;
    });

// get log of probability
    quadGramProbabilities.map(x => {
      quadGramLogs.push(Math.log10(x));
    });
    //console.log('logs', quadGramLogs);

// add all of the logs to get the fitness of the parent
    fitness = quadGramLogs.reduce((a, b) => a + b, 0);
    console.log('fitness = ', fitness);

    console.log(count);
    console.log(key)
    //console.log('key', key)
    console.log(lowestFitness);
//compare newfitness to lowestFitness
    if(fitness > lowestFitness.fitness) { // better plaintext found
      console.log('good')
      count = 0; // reset count
      lowestFitness.fitness = fitness;
      lowestFitness.plainText = plainText;
      //make a new swap
      rand1 = Math.floor(Math.random() * 26) + 1;
      rand2 = Math.floor(Math.random() * 26) + 1;
      //console.log(rand1, rand2);

      //swap new random positions
      key = key.split('');
      let temp = key[rand1];
      key[rand1] = key[rand2];
      key[rand2] = temp;
      key = key.join('');
    }
    else{  // not a better plaintext
      console.log('bad');
      firstSwap ++;
      count++;
      //swap the previous swap back
      key = key.split('');
      let temp = key[rand1];
      key[rand1] = key[rand2];
      key[rand2] = temp;
      key = key.join('');
      //generate 2 random numbers
      rand1 = Math.floor(Math.random() * 26) + 1;
      rand2 = Math.floor(Math.random() * 26) + 1;
      //console.log(rand1, rand2);

      //swap new random positions
      key = key.split('');
      let temp2 = key[rand1];
      key[rand1] = key[rand2];
      key[rand2] = temp2;
      key = key.join('');
    }
  }


  process.exit();
}

/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/


// function to create a random string of *param* length
function makeid(length) {
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
//console.log(makeid(5));

async function getQuadCounts(quadgrams) {
  let sql = 'SELECT * FROM habe.quad_grams WHERE ';
  let values = [];

  quadgrams.map((quadgram, index) => {
    if(index === 0){
      sql += '(quad_gram = ?) ';
      values.push(quadgram);
    }
    else{
      sql += 'OR (quad_gram = ?) ';
      values.push(quadgram);
    }
  });
  return await new Promise((res, rej) => {
    con.query(sql, values , function (error, results) {
      res(results);
    });
  });
}

async function convertCountsToProbs(quadCounts, quadlength) {
  let counts = [];
  let quadGramProbabilities = [];

//filter out counts into counts array
  quadCounts.map(quad => {
    counts.push(quad.count);
  });
  if(counts.length < quadlength){ /// if no counts came back we must add 0's
    let diff = quadlength - counts.length;
    for(let i = 0; i < diff; i++){
      counts.push(0);
    }
  }
  //console.log('counts', counts);

//get probability of each quadgram using the total of all counts => 4224127912
  counts.map(x => {
    quadGramProbabilities.push(x / parseFloat('4224127912'));
  });
  //console.log('probabilities', quadGramProbabilities);
  return quadGramProbabilities;
}
main();
