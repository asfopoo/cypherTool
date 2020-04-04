const fs = require('fs');
const readline = require('readline');
var mysql = require('mysql');


async function readCreated () {

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "**********",
    database: "habe"
  });

  let changed = [];
  let i = 0;
  const fileStream = fs.createReadStream('./english_quadgrams.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    let parts = line.split(' ');
    changed.push({
      'quadGram': parts[0],
      'count': parts[1]
    })
  }

  changed.map(change => {
    let sql = "INSERT INTO habe.quad_grams (quad_gram, count) VALUES ('" + change.quadGram + "', '" + change.count + "' )";
    con.query(sql, function (error, results) {
      if (error) throw error;
    })
  });

  return changed;
}

readCreated().then(response => {
  console.log(response);
});
