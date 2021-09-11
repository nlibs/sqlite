const BS3 = require("better-sqlite3")
const OS = require("os");
const FS = require("fs");

function generate_table_sql(schema, table, sqls)
{
	var cols = schema[table]["columns"];
	var indices = schema[table]["index"];
	if (typeof indices == "undefined")
		indices = [];

	var col_string = "";
	for (var i=0;i<cols.length;i++)
	{

		if (typeof cols[i] == "string")
			cols[i] = [cols[i], "TEXT"];

		col_string += `"${cols[i][0]}" ${cols[i][1]}`;
		if (i != cols.length -1)
			col_string += ", ";
	}

	sqls.push(`CREATE TABLE "${table}" (${col_string})`)

	for (var i=0;i<indices.length;i++)
	{
		if (typeof indices[i] == "string")
			indices[i] = [indices[i]];

		var ind = indices[i];
		var name = `${table}_idx`;
		var fields = "";
		for (var j=0;j<ind.length;j++)
		{
			name += `_${ind[j]}`;
			fields += `'${ind[j]}'`;

			if (j != ind.length -1)
				fields += ", ";
		}

		sqls.push(`CREATE INDEX '${name}' ON '${table}' (${fields})`);
	}
}

function generate_schema_sql(schema)
{
	var sqls = ["BEGIN TRANSACTION"];
	for(var table in schema)
		generate_table_sql(schema, table, sqls);

	sqls.push("COMMIT");
	return sqls;
}

function create_or_open_db(path, schema)
{
	if (FS.existsSync(path))
		return BS3(path);

	var db = BS3(path);
	var sqls = generate_schema_sql(schema);
	for (var i=0;i<sqls.length;i++)
	{
		var s = sqls[i]
		db.prepare(s).run();
	}

	console.log("db created ", path);
	return db;
}


/*
most basic db schema
{
	"user":
	{
		"columns": [ "name", "password" ],
		"index": [ "name" ]
	}
}
*/

class SQLite
{
	constructor(path, schema)
	{
		path = path.replace("~", OS.homedir());
		// TODO validate schema
		this.db = create_or_open_db(path, schema);
	}

	read(sql, params)
	{
		if (typeof params == "undefined")
			params = [];
		return this.db.prepare(sql).all(params);
	}

	write(sql, params)
	{
		this.db.prepare(sql).run(params);
	}

	begin_transaction()
	{
		this.db.prepare("BEGIN TRANSACTION;").run();
	}

	commit_transaction()
	{
		this.db.prepare("COMMIT;").run();
	}
	
}

module.exports = SQLite;