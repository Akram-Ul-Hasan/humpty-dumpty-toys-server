const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bdsz2a.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const toyCollection = client.db("humptyDumptyToys").collection("toys");

    // read operation
    app.get("/toys", async (req, res) => {
      let query = {};
      let result;
      if (req.query?.toyName) {
        query = { toyName: req.query.toyName };
        result = await toyCollection.find(query).toArray();
      } else if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
        result = await toyCollection.find(query).toArray();
      } else if (req.query?.category) {
        query = { category: req.query.category };
        result = await toyCollection.find(query).limit(3).toArray();
      }
      else if (req.query?.sort) {
        const sort = req?.query?.sort === 'true' ? 1 : -1;
        result = await toyCollection.find().sort({ price: sort }).limit(20).toArray();
      }
      else {
        result = await toyCollection.find().limit(20).toArray();
      }
      res.send(result);
    });

    // create operation
    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    // read one data
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    // Update
    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      console.log("hitting");
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete operation
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Humpty Dumpty server is running");
});

app.listen(port, () => {
  console.log(`Humpty Dumpty server is running on port: ${port}`);
});
