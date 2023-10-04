const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at http://localhost:3000/cricket_team/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get API 1
app.get("/players/", async (request, response) => {
  const getQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// POST API 2
app.use(express.json());
app.post("/players/", async (request, response) => {
  const bookDetails = request.body;
  const { playerName, jerseyNumber, role } = bookDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) 
  VALUES (
        '${playerName}',${jerseyNumber},'${role}'
  );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAPI3Query = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const getPlayer = await db.get(getAPI3Query);
  response.send(
    getPlayer.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `UPDATE cricket_team SET 
    player_name = '${playerName}',jersey_number= ${jerseyNumber},role = '${role}';`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

// API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
