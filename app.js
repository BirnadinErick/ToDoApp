// Global obj. declaimers ////////////////////////////////////////////////
const express = require('express');
const bodyParser = require("body-parser")
const app = express();
const mongoose = require('mongoose');
/////////////////////////////////////////////////////////////

// Settings ////////////////////////////////////////////////
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
/////////////////////////////////////////////////////////////

// Database ////////////////////////////////////////////////
// New connection
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
// Model schema representation and initialization
const itemsSchema = mongoose.Schema({name: String});
const Item = mongoose.model("item", itemsSchema);
// New documents creation
const item1 = new Item({name: "Buy Food"});
const item2 = new Item({name: "Cook Food"});
const item3 = new Item({name: "Eat Food"});
const defaultItems = [item1, item2, item3];
/////////////////////////////////////////////////////////////

// Routes ////////////////////////////////////////////////
// GET routes
app.get('/', function (req, res) {
    let date = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = date.toLocaleString("en-US", options);
    // Bringing data from db
    Item.find({}, (err, results) => {
        if (err) {
            console.log(err);
        } else if (results.length === 0) {
            // Inserting new docs inside the db if db is empty
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Items successfully added to list!")
                    res.redirect('/');
                }
            });
        } else {
            res.render("list", {day: day, items: results});
        }
    });

});

// POST routes
app.post('/', function (req, res) {
    const newItem = new Item({name: req.body.newItem}).save();
    res.redirect('/');
});

app.post('/delete', function (req, res) {
    const itemID = req.body.checkbox;
    Item.findByIdAndRemove(itemID, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});
/////////////////////////////////////////////////////////////

// Listening Command ////////////////////////////////////////////////
app.listen(3000, function (req, res) {
    console.log("Listening on port 3000...");
});
/////////////////////////////////////////////////////////////
