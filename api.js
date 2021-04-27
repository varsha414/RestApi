const express = require('express');// you have to require package called express
const app = express(); //create object
//var port = 7800; //define port num
const port = process.env.PORT || 7800;
const bodyParser = require('body-parser');
const mongo = require('mongodb'); // package
const MongoClient = mongo.MongoClient; // method in mongo package
/*var mongourl = "mongodb://localhost:27017"; // url to mongodb with which connection is done */
const mongourl = "mongodb://varsha:Varsha2000d@cluster1-shard-00-00.m95me.mongodb.net:27017,cluster1-shard-00-01.m95me.mongodb.net:27017,cluster1-shard-00-02.m95me.mongodb.net:27017/edurekainternship?ssl=true&replicaSet=atlas-p05ove-shard-0&authSource=admin&retryWrites=true&w=majority";
const cors = require('cors'); // specify cors package 

let db;// give database a name

app.use(cors()); // use our cors package
//app.use(express.json());
app.use(bodyParser.urlencoded({extented:true}));// to encode or decode data (make it in readable format)
app.use(bodyParser.json());


app.get('/health',(req,res) => {
    res.send("api is working")
});

//common route or api
app.get('/',(req,res) => {   
        res.send(`<a href ="http://localhost:7800/location" target= "_blank">City</a> <br> 
                  <a href ="http://localhost:7800/mealtype" target= "_blank">mealtype</a> <br>
                  <a href ="http://localhost:7800/cuisine" target= "_blank">cuisine</a> <br>
                  <a href ="http://localhost:7800/restaurent" target= "_blank">restaurent</a> <br>`)
    })


//route for list of city
app.get('/location',(req,res) => {   // new url location
    db.collection('city').find({}).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})

//route for mealtype
app.get('/mealtype',(req,res) => {   // new url location
    db.collection('mealtype').find({}).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})

//route for order
app.get('/order',(req,res) => {   // new url location
    db.collection('order').find({}).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})


//placeorder
app.post('/placeorder',(req,res) => {
    console.log(req.body);
    db.collection('order').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('posted')
    })
})


/*//route for restaurents
app.get('/restaurent',(req,res) => {   // new url location
    db.collection('restaurent').find({}).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})*/

//for  restaurents based on query of city id
app.get('/restaurent',(req,res) => {   // new url location
    var query = {};
    if(req.query.city && req.query.mealtype){ //if user wants both
        query= {city:req.query.city, "type.mealtype":req.query.mealtype}
    }
    else if(req.query.city){ // if user wants only city
        query={city:req.query.city} // if user gives query
    }
    else if(req.query.mealtype){  //if user also wants mealtype
        query = { "type.mealtype":req.query.mealtype}
    }
    else{
        query={} // else query is blank
    }

    db.collection('restaurent').find(query).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})

//restaurent details
app.get('/restaurentdetails/:id',(req,res) =>{
    var query = {_id:req.params.id}
    db.collection('restaurent').find(query).toArray((err,result) => {
        res.send(result)
    })
})


//restaurentlist
app.get('/restaurentlist/:mealtype',(req,res) => {
    var condition = {};
    if(req.query.cuisine){
        condition = {"type.mealtype":req.params.mealtype,"cuisine.cuisine":req.query.cusine}
    }else if(req.query.city){ //user asks also for city where mealtype is compulsory or common
        condition = {"type.mealtype":req.params.mealtype , city:req.query.city}
    } else if (req.query.lcost && req.query.hcost){ //for cost
        condition = {"type.mealtype":req.params.mealtype , cost:{$lt:Number(req.query.hcost), $gt:Number(req.query.lcost)}}
        /*console.log(condition)*/ // for chechking....take it in nodejs if it is running copy the result nd run that in mongo
    }
    else{
        condition = {"type.mealtype":req.params.mealtype}//user sends only mealtype
    }
    db.collection('restaurent').find(condition).toArray((err,result) => {  //making call mongodb byquery which gives array
        if(err) throw err;
        res.send(result)
    })
})


//connecting with mongodb

MongoClient.connect(mongourl,(err,connection) => {
    if(err) throw err;
    db = connection.db('edurekainternship');// use database to server
    app.listen(port,(err) => {
        if(err) throw err;
        console.log(`server is running on port ${port}`)
    })
})


//delete orders
app.delete('/deleteorder',(req,res) => {
    db.collection('order').remove({id:req.body.id},(err,result) => {
        if(err) throw err;
        res.send('data deleted')
    })
})

//update orders
app.put('/updateorder',(req,res) => {
    db.collection('order').update({id:req.body.id},
    {
        $set:{
            name:req.body.name,
            address:req.body.address
        }
    },(err,result) => {
        if(err) throw err;
        res.send('data updated')
    })
})
