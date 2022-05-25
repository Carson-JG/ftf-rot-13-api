require("dotenv").config();
const http = require("http");
const sqlite3 = require("sqlite3").verbose();

const { HOST, PORT, DATABASE } = process.env;

initHandlers().then(handlers => {
  const server = http.createServer(async (req, res) => {
    try {
      const { method } = req;
      const handler = handlers[method] || handlers.NOT_FOUND;
      handler(req, res);
    } catch (error) {
      handlers.ERROR(req, res);
    }
  });
  server.listen(PORT, HOST);
});

async function initHandlers() {
  const db = await initDb();
  return {
    GET: async (req, res) => {
      const rows = await db.getRows();
      const csv = convertToCsv(rows);
      send(res, { data: csv, contentType: "csv" });
    },
    POST: async (req, res) => {
      const input = await concatBody(req);
      const rot13 = convertToRot13(input);
      await db.save(input);
      send(res, { data: rot13 });
    },
    NOT_FOUND: (req, res) => send(res, { status: 404, data: "Not Found" }),
    ERROR: (req, res) => send(res, { status: 500, data: "Server Error" }),
  };
}

function initDb() {
  const db = new sqlite3.Database(DATABASE);

  function save(input) {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO conversions (input) VALUES ('${input}')`, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  function getRows() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM conversions", (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  return new Promise((resolve, reject) => {
    db.run(
      "CREATE TABLE IF NOT EXISTS conversions (id INTEGER PRIMARY KEY, input TEXT NOT NULL);",
      err => {
        if (err) return reject(err);
        resolve({ save, getRows });
      }
    );
  });
}

function send(res, options) {
  const { data, status = 200, contentType = "text/plain" } = options;
  res.writeHead(status, { "Content-Type": contentType });
  res.end(data);
}

function convertToCsv(rows) {
  rows.unshift({ id: "id", input: "input" });
  const rowsAsCsv = rows
    .map(({ id, input }) => {
      id = `"${id}"`;
      input = `"${input.replace('"', '""')}"`;
      return [id, input].join(",");
    })
    .join("\n");
  return rowsAsCsv;
}

function concatBody(req) {
  return new Promise(resolve => {
    let body = [];
    req.on("data", data => body.push(data));
    req.on("end", () => resolve(body.join("")));
  });
}

function convertToRot13(message) {
  return message.replace(/[a-z]/gi, letter => {
    const lower = letter.toLowerCase();
    const toAdd = lower <= "m";
    const code = letter.charCodeAt(0);
    const rot13Code = toAdd ? code + 13 : code - 13;
    return String.fromCharCode(rot13Code);
  });
}
