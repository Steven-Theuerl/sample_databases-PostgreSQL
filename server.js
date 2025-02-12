const express = require("express");
const { Pool } = require("pg");
// a pool of connections to the database, re-uses existing connections
// to the database , reducing overhead of creating a new connection
const pool = new Pool({
  connectionString:
    "postgresql://postgres:mysecretpassword@localhost:5432/message_boards",
  //the protocol://the user:the password@the host:the port/the database
});

async function init() {
  const app = express();

  app.get("/get", async (req, res) => {
    const client = await pool.connect();
    const [commentRes, boardRes] = await Promise.all([
      client.query(
        "SELECT * FROM comments NATURAL LEFT JOIN rich_content WHERE board_id = $1",
        [req.query.search]
        // $1 will be replaced with the value of req.query.search
      ),
      client.query("SELECT * FROM boards WHERE board_id = $1", [
        req.query.search,
      ]),
    ]);
    // promise.all will not mark resolve until all promises are resolved
    res.json({
      status: "ok",
      board: boardRes.rows[0] || {},
      posts: commentRes.rows || [],
    });
  });

  const PORT = 3000;
  app.use(express.static("./static"));
  app.listen(PORT);

  console.log(`Running on http://localhost:${PORT}`);
}

init();
