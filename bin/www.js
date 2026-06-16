const { error, debug } = require("console");
const app = require("./app");
const http = require("http");

const PORT = normalizePort(process.env.PORT || "3000");
app.set("port", PORT);

// app.listen(PORT, () => console.log(`Server Started at port ${PORT}`));
const server = http.createServer(app);

server.listen(PORT);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(param) {
  let port = parseInt(param, 10);
  return port === NaN ? param : port;
}

function onError(err) {
  if (err.syscall !== "listen") throw err;

  let bind = typeof PORT === "string" ? "Pipe" + PORT : "Port" + PORT;

  switch (err.code) {
    case "EACCES":
      console.error(bind + " Require elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is ALready in USE");
      process.exit(1);
      break;
    default:
      throw err;
  }
}

app.get("/", (req, res) => {
  res.send("<html><body><h1>Hello From NodeJS</h1></body></html>");
});

function onListening() {
  let addr = server.address();
  let bind = typeof PORT === "string" ? "Pipe" + addr : "Port " + addr.port;
  debug("listening on " + bind);
}
