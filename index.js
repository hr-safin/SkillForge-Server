const express = require("express")
const app = express()
require("dotenv").config();
const cors =  require("cors")
const jwt = require("jsonwebtoken")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port  = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())

//USX749MhNgJHA9S5


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xat17xd.mongodb.net/?retryWrites=true&w=majority`;
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
    const enrolledCollection = client.db("enrollDB").collection("enroll")
    

    app.get("/course",async (req,res) =>{
        const cursor = courseCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get("/enroll/:id", async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await courseCollection.findOne(query)
      res.send(result)
    })

    app.get("/payment/:id", async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await courseCollection.findOne(query)
      res.send(result)
    })


    // payment intent

    app.post("/create-payment-intent", async(req, res) => {
      const {price} = req.body

      const amount = parseInt(price * 100)
      console.log("amount inside :", amount)
      const paymentIntent = await stripe.paymentIntents.create({
        amount : amount,
        currency : "usd",
        payment_method_types : ["card"]
      })

      res.send({
        clientSecret : paymentIntent.client_secret
      })
    })


    app.post("/enrolled", async(req,res) => {
      const enroll = req.body
      const result = await enrolledCollection.insertOne(enroll)
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