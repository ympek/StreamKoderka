const express = require('express')
const app = express()
const cors = require('cors')
const port = 7001

app.use(cors())
app.use(express.static('public'))

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
