//////////////////////////////////
// Dependencies
/////////////////////////////////
// get .env variables
require("dotenv").config()
// pull PORT from .env, give it a default of 3000 (object destructuring)
const {PORT = 3001, DATABASE_URL} = process.env
// import express
const express = require("express")
// create the application object
const app = express()
// import mongoose
const mongoose = require("mongoose")
// import middleware
const cors = require("cors")
const morgan = require("morgan")

/////////////////////////////////
//Middleware
//////////////////////////////////
app.use(cors()) // prevent cors errors, opens up access for frontend
app.use(morgan("dev")) //logging
app.use(express.json()) // parse json bodies


/////////////////////////////////
// Database Connection
////////////////////////////////
// establish connection
mongoose.connect(DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// Connection Events
mongoose.connection
.on("open", () => console.log("You are connected to Mongo"))
.on("close", () => console.log("You are disconnected from Mongo"))
.on("error", (error) => console.log(error))

//////////////////////////////
// Models
//////////////////////////////
// the user schema
const UserSchema = new mongoose.Schema({
  authCode: String
}, {timestamps: true})

const User = mongoose.model("User", UserSchema)

// the product schema
const ProductSchema = new mongoose.Schema({
  name: String,
  price: String,
  department: String,
  aisle: String,
  image: String,
  location: String
}, {timestamps: true})

const Products = mongoose.model("Products", ProductSchema)

//////////////////////////////
// Environment
//////////////////////////////
const apiBaseUrl = process.env.API_BASE_URL 
const oauth2BaseUrl = process.env.OAUTH2_BASE_URL
const clientId = process.env.CLIENT_ID 
const redirectUrl = process.env.REDIRECT_URL
const clientSecret = process.env.CLIENT_SECRET

////////////////////////////////
// Authorization
////////////////////////////////
// Authorization code redirect initiated by 'login' event from Sign In button
function redirectToLogin() {
  // Must define all scopes needed for application
  const scope = encodeURIComponent('product.compact cart.basic:write profile.compact');
  // Build authorization URL
  const url =
      // Base URL (https://api.kroger.com/v1/connect/oauth2)
      `${oauth2BaseUrl}/authorize?` +
      // ClientId (specified in .env file)
      `client_id=${encodeURIComponent(clientId)}` +
      // Pre-configured redirect URL (http://localhost:3000/callback)
      `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
      // Grant type
      `&response_type=code` +
      // Scope specified above
      `&scope=${scope}`;
  // Browser redirects to the OAuth2 /authorize page
  // window.location.href = url;
  return url
}

////////////////////////////////
// Routes
////////////////////////////////
// USER index route
app.get("/", (req, res) => {
  // initialize OAuth
  res.redirect(redirectToLogin())
})

// USER create route
app.route('/test')
.get(async (req, res, next) => {
  const authCode = req.originalUrl.slice(req.originalUrl.indexOf('=')+1)
  try {
    // create a new user
    res.json(await User.create({authCode: authCode}));
  } catch (error) {
    res.status(400).json({ error });
  }
})
.get(async (req, res, next) => {
  res.send('nice')
}

// PRODUCT index route
app.get("/products", async (req, res) => {
  try {
    // send all products
    res.json(await Products.find({}));
  } catch (error) {
    res.status(400).json({ error });
  }
});


// PRODUCT create route
app.post("/products", async (req, res) => {
  try {
    // create a new product
    res.json(await Products.create(req.body));
  } catch (error) {
    res.status(400).json({ error });
  } 
});


// update route
app.put("/products/:id", async (req, res) => {
  try {
    // update a product
    res.json(await Products.findByIdAndUpdate(req.params.id, req.body, {new: true}));
  } catch (error) {
    res.status(400).json({ error });
  }
})  

// Destroy Route 
app.delete("/products/:id", async (req, res) => {
  try {
    // delete a product
    res.json(await Products.findByIdAndRemove(req.params.id));
  } catch (error) {
    res.status(400).json({ error });
  }
})

  


/////////////////////////////////
// Server Listener
/////////////////////////////////
app.listen(PORT, () => {console.log(`listening on PORT ${PORT}`)})