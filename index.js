const connectMongo = require("./db");
const express = require('express')

connectMongo();

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello Nikka...!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
