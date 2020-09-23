import express from "express";
import * as path from 'path';

const app = express(); // create express app

// Dummy service called by heroku process scheduler to prevent free dyno from sleeping
app.get("/keepalive", (req, res) => {
  res.sendStatus(200);
});

app.use(express.static(path.join(__dirname, '../', 'build')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
