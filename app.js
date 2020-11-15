// Global obj. declaimers ////////////////////////////////////////////////
const express = require('express');
const bodyParser = require("body-parser")
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
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
// Schema
const itemsSchema = mongoose.Schema({name: String});
const listSchema = mongoose.Schema({name: String, items: [itemsSchema]});
// Models
const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listSchema);
// New documents creation
const item1 = new Item({name: "Buy Food"});
const item2 = new Item({name: "Cook Food"});
const item3 = new Item({name: "Eat Food"});
const defaultItems = [item1, item2, item3];
/////////////////////////////////////////////////////////////

// Routes ////////////////////////////////////////////////
// GET routes
app.get('/', function (req, res) {
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
            res.render("list", {title: "Today", items: results});
        }
    });

});

app.get('/favicon.ico', (req, res) => {
    // console.log("favicon.ico");
});

app.get("/:customListName", function (req, res) {
    const customListName = _.lowerCase(req.params.customListName);

    List.findOne({name: customListName}, function (err, foundDoc) {
        if (err) {
            console.log(err);
        } else if (foundDoc) {
            res.render('list', {title: _.capitalize(customListName), items: foundDoc.items});
        } else {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect('/' + customListName);
        }
    });
});

// POST routes
app.post('/', function (req, res) {
    const newItem = new Item({name: req.body.newItem});
    const listName = _.lowerCase(req.body.listName);

    if (listName === "today") {
        newItem.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, (err, foundDoc) => {
            foundDoc.items.push(newItem);
            foundDoc.save();
            res.redirect('/' + listName);
        });
    }

});

app.post('/delete', function (req, res) {
    const itemID = req.body.checkbox;
    const listName = _.lowerCase(req.body.listName);

    if (listName === "today"){
        Item.findByIdAndRemove(itemID, (err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}},(err,result)=>{
            if (!err) {
                res.redirect('/'+listName);
            }
        });
    }

});
/////////////////////////////////////////////////////////////

// Listening Command ////////////////////////////////////////////////
app.listen(3000, function (req, res) {
    console.log("Listening on port 3000...");
});
/////////////////////////////////////////////////////////////
