var readlineSync = require('readline-sync');
var mysql = require('mysql');
var async = require("async");

let quadGramCounts = [];


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "*********",
  database: "*********"
});

async function main () {


// Wait for user's response.
//var cipherText = readlineSync.question('Please enter the cipher text: ');

  //given a cipher text and a row length
  let plainText = 'nalcxehwttdttfseeleedsoaxfeahl';
  let cipherLength = plainText.length;
  let quadLength = cipherLength - 3;
  let rowLength = 6;
  let columnar = [];


  let count = 0;
  let lowestFitness = {
    plainText: '',
    fitness: -999999999999999999999999.00        //set lowest fitness to negative infinity
  };

//convert cipherText into a matrix by reading them into the columns from top to bottom, left to right
  let arr = [];
  for(let i = 0; i < rowLength - 1; i++){
    arr.push([]);
  }

  let text = 0;
  for(let i = 0; i < rowLength; i++){
    for (let j = 0; j < arr.length; j++){
      arr[j].push(plainText[text]);
      text++;
    }
  }
  columnar = arr;

  console.log('columnar b4 swap', columnar);
  //make new swap nums
  let rand1 = Math.floor(Math.random() * rowLength);
  let rand2 = Math.floor(Math.random() * rowLength);
  console.log('rand1', rand1);
  console.log('rand2', rand2);

  //swap new random columns
  for(let i = 0; i < columnar.length; i++){
    for (let j = 0; j < rowLength; j++) {
      if(j === rand1) {
        let temp = columnar[i][rand1];
        columnar[i][rand1] = columnar[i][rand2];
        columnar[i][rand2] = temp;
      }
    }
  }
  console.log('columnar after swap', columnar);

  //turn back to string
  plainText = '';
  for(let i = 0; i < columnar.length; i++){
    for(let j = 0; j < rowLength; j++){
      plainText += columnar[i][j];
      //console.log(columnar[i][j])
      //console.log(i, " ", j)
    }
  }
  console.log('plaintext all before while', plainText);


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  while (count <= 1000) {
    let quadgrams = [];
    let quadCounts = [];
    let quadGramProbabilities = [];
    let quadGramLogs = [];
    let fitness = -999999999999999999999999.00;
    console.log('plaintext', plainText);


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
        console.log('quadcounts', quadCounts);
    });


//get probabalitiy of quadgram
    await convertCountsToProbs(quadCounts, quadLength).then(response => {
      quadGramProbabilities = response;
      console.log('quad probs', quadGramProbabilities)
    });

// get log of probability
    quadGramProbabilities.map(x => {
      quadGramLogs.push(Math.log10(x));
    });
    console.log('logs', quadGramLogs);

// add all of the logs to get the fitness of the parent
    fitness = quadGramLogs.reduce((a, b) => a + b, 0);
    console.log('fitness = ', fitness);

    console.log(count);
    console.log(lowestFitness);
//compare newfitness to lowestFitness
    if(fitness > lowestFitness.fitness) { // better plaintext found
      console.log('good');
      count = 0; // reset count
      lowestFitness.fitness = fitness;
      lowestFitness.plainText = plainText;

      console.log('columnar', columnar)
      //make new swap nums
      rand1 = Math.floor(Math.random() * rowLength);
      rand2 = Math.floor(Math.random() * rowLength);

      //swap new random columns
      for(let i = 0; i < columnar.length; i++){
        for (let j = 0; j < rowLength; j++) {
          if(j === rand1) {
            let temp = columnar[i][rand1];
            columnar[i][rand1] = columnar[i][rand2];
            columnar[i][rand2] = temp;
          }
        }
      }
      console.log('columnar', columnar);
      //turn back to string
      plainText = '';
      console.log('should be empyt', plainText);
      for(let i = 0; i < columnar.length; i++){
        for(let j = 0; j < rowLength; j++){
          console.log(columnar);
          plainText += columnar[i][j];
          //console.log(columnar[i][j])
          //console.log(i, " ", j)
          //console.log(plainText)
        }
      }
      console.log('plaintext', plainText)
    }
    else{  // not a better plaintext
      console.log('bad');
      count++;
      //swap the previous swap back
      for(let i = 0; i < columnar.length; i++){
        let temp = columnar[i][rand1];
        columnar[i][rand1] = columnar[i][rand2];
        columnar[i][rand2] = temp;
      }

      //generate 2 random numbers
      rand1 = Math.floor(Math.random() * rowLength);
      rand2 = Math.floor(Math.random() * rowLength);

      //swap new random columns
      for(let i = 0; i < columnar.length; i++){
        for (let j = 0; j < rowLength; j++) {
          if(j === rand1) {
            let temp = columnar[i][rand1];
            columnar[i][rand1] = columnar[i][rand2];
            columnar[i][rand2] = temp;
          }
        }
      }
      //turn back to string
      plainText = '';
      for(let i = 0; i < columnar.length; i++){
        for(let j = 0; j < rowLength; j++){
          plainText += columnar[i][j];
          //console.log(columnar[i][j])
          //console.log(i, " ", j)
          //console.log(plainText)
        }
      }
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
