const express = require("express")
const app = express()
const cors =  require("cors")
const port  = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())


app.get("/", (req, res) => {
    res.send("Website is running")
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})