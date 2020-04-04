var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "***********",
  database: "habe"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  //var sql = "DROP table quad_grams";
  var sql = "CREATE TABLE quad_grams (id INT AUTO_INCREMENT PRIMARY KEY, quad_gram VARCHAR(255), count INTEGER)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
