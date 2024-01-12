const express = require("express")
const app = express()
const cors =  require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');
const port  = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())

//USX749MhNgJHA9S5


const uri = "mongodb+srv://rahmansafin559:USX749MhNgJHA9S5@cluster0.xat17xd.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const courseCollection = client.db("courseDB").collection("course")
    const purchaseCollection = client.db("purchaseDB").collection("purchase")
    

    app.get("/course",async (req,res) =>{
        const cursor = courseCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Website is running")
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})