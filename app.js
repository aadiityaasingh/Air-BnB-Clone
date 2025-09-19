const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected db");
  })
  .catch((err) => [console.log(err)]);

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req, res) => {
  res.send("HI i am root");
});

//index route
app.get("/listings", wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

app.post("/listings", wrapAsync(async (req, res, next) => {
  if(!req.body.listing) { throw new ExpressError(400, "Invalid Listing Data")}
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
      let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing})
}));

app.put("/listings/:id",wrapAsync(async (req,res) => {
    if(!req.body.listing){ throw new ExpressError(400, "Invalid Listing Data")}
    let {id} = req.params;
   await Listing.findByIdAndUpdate(id, {...req.body.listing});
   res.redirect(`/listings/${id}`)
}));

app.delete("/listings/:id" , wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id)
    res.redirect(`/listings`)
}));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My home",
//     description: "near the park",
//     price: 15000,
//     location: "chapra, bihar",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("sammple was saved")
//   res.send("testing success")
// });

app.all(/.*/, (req,res,next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let {statusCode=500, message="something went wrong"} = err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
})

app.listen(8080, () => {
  console.log("server is running");
});
