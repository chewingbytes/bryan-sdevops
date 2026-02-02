var express = require("express");
var bodyParser = require("body-parser");
var app = express();

const PORT = process.env.PORT || 5050;
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const { retrieveUsers } = require("./utils/retrieveUserUtil");
app.get("/retrieve-users", retrieveUsers);

const { addUser } = require("./utils/jonathanUtil");
app.post("/add-user", addUser);


const { deleteBook } = require('./utils/williamUtil')
app.delete('/delete-book', deleteBook)

const { updateBook } = require('./utils/editBookUtil')
app.put('/books/:title', updateBook)

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
});

const { addBook } = require("./utils/bryanUtil");
app.post("/books", addBook);

const { getBooks } = require("./utils/retrieveBooksUtil");
app.get("/books", getBooks);

server = app.listen(PORT, function () {
  try {
    const address = server && server.address ? server.address() : null;
    if (!address || !address.port) {
      console.log(`Demo project at: http://localhost:${PORT}`);
      return;
    }
    const host = address.address == "::" ? "localhost" : address.address;
    const baseUrl = `http://${host}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
  } catch (e) {
    console.log(`Demo project at: http://localhost:${PORT}`);
  }
});

module.exports = { app, server };
