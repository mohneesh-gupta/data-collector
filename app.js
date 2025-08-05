const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const FormData = require("./models/FormData"); // Importing the FormData model collection
const methodOverride = require("method-override"); // Importing method-override to handle DELETE requests

const app = express();

// --- MongoDB Connection ---
mongoose.connect("mongodb://127.0.0.1:27017/test-data-store", {
  useNewUrlParser: true, // useNewUrlParser is deprecated but still used for compatibility
  useUnifiedTopology: true, // useUnifiedTopology is recommended for the new Server Discover and Monitoring engine
});
const db = mongoose.connection; // Connection to the database
db.on("error", console.error.bind(console, "MongoDB connection error:")); // Log any connection errors
db.once("open", () => console.log("✅ Connected to MongoDB")); // Successful connection message

// --- Middleware ---
app.use(methodOverride('_method')); // Middleware to allow DELETE requests
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --- View Engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Routes ---

// Home (form)
app.get("/", (req, res) => {
  res.render("index.ejs"); // Render the form view
});

// Handle form submission
app.post("/forms", async (req, res) => { // Handle form submission
  const { email, name, mobile } = req.body; // Destructure the form data

  if (!email || !name || !mobile) { // Check if all fields are filled
    return res.status(400).send("⚠️ All fields are required.");
  }

  try { // Create a new entry in the FormData collection
    const newEntry = new FormData({ email, name, mobile }); // Create a new instance of FormData
    await newEntry.save(); // Save the new entry to the database
    // res.redirect("/");
    // res.send("✅ Form submitted successfully.");

    res.render("success.ejs"); // Render the success view after saving the form data

  } catch (err) { // Handle any errors during the save operation
    console.error("❌ Error saving form:", err); // Log the error
    res.status(500).send("Server error"); // Send a server error response
  }
});

// Redirect to home page after form submission
app.get("/gotohome", (req, res) => {
  res.redirect("/"); // Redirect to the home page after form submission
});

// View all entries
app.get("/all", async (req, res) => {
  try {
    const entries = await FormData.find().sort({ _id: -1 }); //{extracting all entries from the FormData collection and sorting by _id in descending order}
    res.render("all", { entries });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});

// View a specific entry
app.get("/entry/:id", async (req, res) => {
  const entryId = req.params.id;
  try {
    const entry = await FormData.findById(entryId);
    res.render("entry.ejs", { entry }); // Render the entry view with the fetched entry data
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});

// Delete an entry
app.delete("/entry/delete/:id", async (req, res) => {
  const entryId = req.params.id;
  try {
    await FormData.findByIdAndDelete(entryId); // Delete the entry by its ID
    res.redirect("/all"); // Redirect to the all entries page after deletion
  } catch (error) {
    console.error("❌ Error deleting entry:", error);
    res.status(500).send("Error deleting entry");
  }
});


// --- Start Server ---
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`); 
});
