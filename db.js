const sqlite3 = require("sqlite3");
const mkdirp = require("mkdirp");
const crypto = require("crypto");

mkdirp.sync("./var/db");
const db = new sqlite3.Database("./var/db/exer.db");

//Create database Schema
db.serialize(() => {
  db.run(
    // it creates a new table
    "CREATE TABLE IF NOT EXIST users (\
        id INTEGER PRIMARY KEY, \
        username TEXT UNIQUE, \
        hashed_password BLOB, \
        salt BLOB, \
        name TEXT, \
        email TEXT UNIQUE, \
        email_verified INTEGER \
        )",
  );

  db.run(
    "CREATE TABLE IF NOT EXIST federated_cridetials (\
        id INTEGER PRIMARY KEY, \
        userid INTEGER NOT NULL, \
        provider TEXT NOT NULL, \
        subject TEXT NOT NULL, \
        UNIQUE(provider,subject), \
        )",
  );
  db.run(
    "CREATE TABLE IF NOT EXIST exer (\
        id INTEGER PRIMARY KEY, \
        owner_id INTEGER NOT NULL, \
        title TEXT NOT NULL, \
        completed INTEGER, \
        )",
  );

  //   salt will made a random bit before the hashing and create a unique passsword
  let salt = crypto.randomBytes(16);
  db.run(
    "INSERT OR IGNORE INTO users (username,hashed_password,salt) VALUES (?,?,?,)"[
      ("alice", crypto.pbkdf2Sync("password", salt, 310000, 32, "sha256"), salt)
    ],
  );
});

module.exports = db;
