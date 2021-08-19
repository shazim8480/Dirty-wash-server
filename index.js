const express = require("express");
const app = express();
// const MongoClient = require("mongodb").MongoClient;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
// const fileUpload = require("express-fileupload");
// const fs = require("fs-extra");

// for env variable//
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "/serviceImages")));
// app.use(fileUpload());

//configure mongodb////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const servicesCollection = client.db("dirtyWash").collection("services");
  const ordersCollection = client.db("dirtyWash").collection("orders");
  const reviewsCollection = client.db("dirtyWash").collection("reviews");
  const adminsCollection = client.db("dirtyWash").collection("admins");
  console.log("Database connection established!");

  //creating API to add service from admin (Create) //
  app.post("/addService", (req, res) => {
    const newService = req.body;
    console.log("adding a new service by admin", newService);
    servicesCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });

  //read data for showing all the created services to UI
  app.get("/services", (req, res) => {
    servicesCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //delete service item////////////
  app.delete("/deleteService/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    console.log("deleting this", id);
    servicesCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send(documents.deletedCount > 0);
      console.log("deleted count", documents.deletedCount);
    });
  });

  //   // buy now onclick get SERVICE data//
  app.get("/service/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    servicesCollection.find({ _id: id }).toArray((err, documents) => {
      console.log(documents);
      res.send(documents[0]); // must//
    });
  });

  //////////////////// ORDERS COLLECTION SECTION//////////////////////////////////

  // for adding ORDERS upon confirmation of payment /////////////
  app.post("/addOrder", (req, res) => {
    const newOrder = req.body;
    console.log("adding a new order", newOrder);
    ordersCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });

  //for showing all the orders to ADMIN /////////////
  app.get("/allOrders", (req, res) => {
    ordersCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //for showing all the orders by specific USER on user dashboard //
  app.get("/userOrders", (req, res) => {
    ordersCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
    });
  });

  //////////////////// Reviews COLLECTION SECTION//////////////////////////////////

  // for adding Reviews upon submission /////////////
  app.post("/addReview", (req, res) => {
    const newReview = req.body;
    console.log("adding a new Review", newReview);
    reviewsCollection.insertOne(newReview).then((result) => {
      // console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  //for showing all the Reviews to UI /////////////
  app.get("/allReviews", (req, res) => {
    reviewsCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //////////////////// MAKE ADMIN SECTION//////////////////////////////////
  app.post("/makeAdmin", (req, res) => {
    const email = req.body.email;
    console.log("adding new admin", email);
    //{email} because it's a part of the whole body//
    adminsCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // VIP Service only for admins :p //
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email }).toArray((err, admins) => {
      console.log(admins);
      res.send(admins.length > 0);
    });
  });
  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello Dirty Wash!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
