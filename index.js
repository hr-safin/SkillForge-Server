const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

//USX749MhNgJHA9S5

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xat17xd.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const courseCollection = client.db("courseDB").collection("course");
    const enrolledCollection = client.db("enrollDB").collection("enroll");
    const userCollection = client.db("userDB").collection("user")

    app.get("/course", async (req, res) => {
      const cursor = courseCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.send(result);
    });

    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.send(result);
    });

    // payment intent

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;

      const amount = parseInt(price * 100);
      console.log("amount inside :", amount);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/enrolled", async (req, res) => {
      const enroll = req.body;
      const result = await enrolledCollection.insertOne(enroll);
      res.send(result);
    });

    // enrolled course

    app.get("/enrolled/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await enrolledCollection.find(query);
      res.send(result);
    });


    // middleware

    const verifyToken = (req, res, next) => {
      console.log("inside verify token", req.headers)
      if(!req.headers.authorization){
        return res.status(401).send({message : "forbidden access"})
      }

      const token = req.headers.authorization.split(" ")[1]
      console.log("inside token", token)
      jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if(err){
          return res.status(403).send({message : "unauthorized access"})
        }

        req.decoded = decoded
        next()
      })
     
    }

    // all user api

    app.get("/allUser", verifyToken, async(req,res) => {
     console.log(req.headers)
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/allUser",  async (req, res) => {
      const userDetails = req.body;
      const query = { email: userDetails?.email };
      const exist = await userCollection.findOne(query);
      if(exist) {
        return res.send({ message: "Email is already used", insertedId: null });
      }

      const result = await userCollection.insertOne(userDetails);
      res.send(result);
    });

    // token generate

    app.post("/jwt", async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "3hr",
      });
      res.send({token})
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Website is running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
