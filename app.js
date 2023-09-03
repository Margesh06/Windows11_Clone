const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const https = require("https");

const path = require('path');
const qr = require("qr-image");
const fs = require("fs");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://admin-Margesh:margesh@cluster0.dgnbguu.mongodb.net/todolistDB", { useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new title"
});
const item3 = new Item({
  name: "<-- hit this to delete item"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/list",function(req, res){

  async function myitems() {
    const items = await Item.find({});
    if (items.length === 0) {
      await Item.insertMany(defaultItem);
      const displayItems = await Item.find({});
      res.render("list", { listTittle: "Today", newlistitems: displayItems });
    } else {
      const displayItems = await Item.find({});
      res.render("list", { listTittle: "Today", newlistitems: displayItems });
    }
  }

myitems();

});

app.get("/drum",function(req,res){
  res.render("drum")
})

app.get("/dice",function(req,res){
  res.render("dice")
})

app.post("/list",function(req,res){
  const itemName = req.body.newitem;
  const listN = req.body.list;

   const item = new Item({
     name: itemName,
   });

     item.save();
     res.redirect("/list");


});



app.post("/delete",function(req,res){
  const checkitemid = req.body.checkbox;
  const listName = req.body.listName;

    async function remitems() {
      const remove = await Item.findByIdAndRemove(checkitemid);
      res.redirect("/list");
    }
    remitems();

});

app.get("/",function(req,res){
  res.render("index");
})

app.get("/failure",function(req,res){
  res.render("failure");
})

app.get("/win",function(req,res){
  res.render("win");
})

app.get("/snake",function(req,res){
  res.render("snake");
})

app.get("/qr",function(req,res){
  res.render("qr");
})

app.get("/display",function(req,res){
  res.render("display")
})

app.get("/weather",function(req,res){
  res.render("weather")
})

app.post("/weather",function(req,res){
   //console.log("received");
   const query = req.body.cityname;
   const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=d9255538aeaf08cde3d8a7939db9a882&units=metric";

   https.get(url,function(response){
     response.on("data",function(data){
       const weatherData = JSON.parse(data);
       const temp = weatherData.main.feels_like;
     //  console.log(temp);
       const description = weatherData.weather[0].description;
     //  console.log(description);
      const icon = weatherData.weather[0].icon;
      const imageurl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
      res.write("<p> The weather is currently " + description + "<p>");
      res.write("<h1> The temperature in " + query + " is " + temp + " degress celsius.<h1/>");
      res.write("<img src=" + imageurl + ">");

       res.send()
     })
   })

})

app.post("/qr",function(req,res){
  const url = req.body.url;


      var qr_svg = qr.image(url);
      const imageFilePath = path.join(__dirname, "public", "images", "qr_img.png");
      qr_svg.pipe(fs.createWriteStream(imageFilePath));

      fs.writeFile("URL.txt", url, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
        res.redirect("display");
      });


})

app.post("/",function(req,res){
  const password = req.body.passw;
  if(password === "123"){
    res.render("win");
  }
  else{
    res.render("failure");
  }
})

app.post("/failure",function(req,res){
  res.redirect("/");
})

app.listen(3000,function(req,res){
  console.log("Server started on port 3000");
})
