const SQLITE = require("./sqlite.js");

var schema = 
{
	"user":
	{
		"columns": [ "name","password" ],
		"index": [ "name" ]
	}
}

var db = new SQLITE("~/deneme.db", schema);
db.write("insert into user values (?,?)", ["alper", "132132"]);
console.log(db.read("select * from user"));