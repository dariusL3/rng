const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.static('public'))
app.use(express.static('node_modules'))
app.use(cors('http://localhost:8103'))

app.listen(8080, () => console.log('Server listening on port 8080'))