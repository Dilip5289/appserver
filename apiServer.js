const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://dilip:dilip5289@giftdelivery.rmxl2.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   
  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})

app.post('/registerUser', (req, res) => {
    console.log("POST request received for user registration: " + JSON.stringify(req.body) + "\n");

    const newUser = req.body;

    userCollection.insertOne(newUser, function(err, result) {
        if (err) {
            console.log("Error inserting user: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log("User record with ID " + result.insertedId + " has been inserted\n");
            res.status(201).send(result);
        }
    });
});

app.post('/getUserOrders', (req, res) => {
    console.log("POST request received for getting user orders: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email; 

    orderCollection.find({ customerEmail: userEmail }).toArray(function (err, docs) {
        if (err) {
            console.log("Error retrieving orders: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log(JSON.stringify(docs) + " orders have been retrieved.\n");
            res.status(200).send(docs);
        }
    });
});
 
app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n"); 

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
			console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});

app.post('/getUserOrdersForDeletion', (req, res) => {
    console.log("POST request received to get orders for deletion: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email; 

    orderCollection.find({ customerEmail: userEmail }).toArray(function (err, docs) {
        if (err) {
            console.log("Error retrieving orders for deletion: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log(JSON.stringify(docs) + " orders have been retrieved for deletion.\n");
            res.status(200).send(docs);
        }
    });
});

app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n"); 

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.post('/verifyUser', (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	loginData = req.body;

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});


app.post('/postOrderData', function (req, res) {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 
    
    orderCollection.insertOne(req.body, function(err, result) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		}else {
			console.log("Order record with ID "+ result.insertedId + " have been inserted\n"); 
			res.status(200).send(result);
		}
		
	});
       
});

app.delete('/deleteOrders', (req, res) => {
    console.log("DELETE request received to delete orders: " + JSON.stringify(req.body) + "\n");

    if (!req.body.orderIds || !Array.isArray(req.body.orderIds)) {
        return res.status(400).send({ message: 'Invalid request: orderIds is required and must be an array' });
    }

    const orderIds = req.body.orderIds.map(id => new ObjectId(id));

    orderCollection.deleteMany({ _id: { $in: orderIds } }, function (err, result) {
        if (err) {
            console.log("Error deleting orders: " + err + "\n");
            res.status(500).send(err);
        } else {
            console.log(result.deletedCount + " orders have been deleted.\n");
            res.status(200).send({ deletedCount: result.deletedCount });
        }
    });
});
  
app.listen(port, () => {
  console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
