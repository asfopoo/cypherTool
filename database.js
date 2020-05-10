var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "*********",
  database: "*********"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  //var sql = "DROP table quad_grams";
  //let sql = "delete from entrant";
  //let sql = "delete from barred_granfalloons";
  //let sql = "alter table york_city.entrant Drop column barredFrom";
  //let sql = "ALTER TABLE york_city.barred_granfalloons ADD barredFrom int NOT NULL";
  //let sql = "CREATE TABLE user (ID int NOT NULL, barName varchar(255), password varchar(255), PRIMARY KEY (ID))";
  //let sql = "ALTER TABLE barred_granfalloons ADD FOREIGN KEY (barredFrom) REFERENCES user(ID)"
  //let sql = "ALTER TABLE entrant RENAME entrant_granfalloons";

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
