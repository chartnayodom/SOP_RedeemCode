//database uri if localhost is not working try 127.0.0.1:{port}
const db_uri = "mongodb://127.0.0.1:27017";
//database name
const db_name = "SOA";
//collection which want to store code
const db_collection = "code";

module.exports = {db_uri, db_name, db_collection}

