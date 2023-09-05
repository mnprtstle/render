//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://manpeetsiv:Chal0dh%40kkpay1e%21@cluster0.vp4hlkz.mongodb.net/todoListDB");

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item(
  {
    name:"Code"
  }
);
const item2 = new Item(
  {
    name:"Sleep"
  }
);
const item3 = new Item(
  {
    name:"Repeat!!!!!!!!!"
  }
);
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find()
  .then(function(items){
  if(items.length===0){
Item.insertMany(defaultItems)
.then(function(){
  console.log("success rendi shehar vich shor kardi!"); 
})
.catch(function(err){
  console.log(err);
})
  res.redirect("/");
} else{ 
    res.render("list", {listTitle: "Today", newListItems: items});
}
  })
  .catch(function(err){
    console.log(err);
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName})
  .then(function(foundList){
    if(foundList){
      //show an existing list
      console.log("exists");
      res.render("list.ejs", {listTitle: foundList.name, newListItems: foundList.items})
    }else{
      //Create a new list
      console.log("Doesn't exist");
     const list = new List({
      name: customListName,
      items: defaultItems
      }); 
      list.save();
      res.redirect(`/${customListName}`)
    }
    })
  .catch(function(err){console.log(err)})
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item4 = new Item({
    name: itemName
  });
  if(listName === "Today"){
     item4.save();
  res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect(`/${listName}`);
    })
  }
 
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId)
  .then(function(){
    res.redirect("/");
    console.log("successfully removed item");
  }  )
  .catch(function(err){
    console.log(err);
  });
}else{
    List.findOneAndUpdate({name: listName}, { $pull: { items: { _id: checkedItemId }}})
    .then(function(foundList){
      res.redirect(`/${listName}`);
    })
    .catch(function(err){
      console.log(err);
    })
  }

});


app.get("/about", function(req, res){
  res.render("about.ejs");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
