const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');


// MiddleWares
require('dotenv').config()
app.use(express.json());
app.use(cors());



// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jbkru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
try{
    client.connect()
    
    const database = client.db('acl_motors');
    const motorsCollection = database.collection('motorsAll');
    const orderedCollection = database.collection('orderedUsers');
    const reviewCollection = database.collection('customerReviews');
    const usersCollection = database.collection('users')


    // get motors api
    app.get('/motorsAll', async(req, res)=>{
        const motorsAll = await motorsCollection.find({}).toArray();
        res.send(motorsAll);
    })


    // get ordered all api
    app.get('/orderedUsers', async(req, res)=>{
        const orderedUsers = await orderedCollection.find({}).toArray();
        res.json(orderedUsers);
    })


    // get ordered user api
    app.get('/orderedUsers/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const result = await orderedCollection.find(query).toArray();
        res.json(result)
    })

    // get customers review api
    app.get('/customerReviews', async(req, res)=>{
        const result = await reviewCollection.find({}).toArray();
        res.json(result)
    })

    // get admin user 
    app.get('/users/:email', async(req, res)=>{
        const email = req.params?.email;
        const filter = {email: email};
        const result = await usersCollection.findOne(filter); 
        let isAdmin = false;
        if(result?.role  === 'admin'){
            isAdmin = true;
        }
        res.json(isAdmin);
    })


    // post place order api
    app.post('/orderedUsers', async(req, res)=>{
        const orderedUser = req.body;
        const result = await orderedCollection.insertOne(orderedUser)
        res.json(result)
    })


    // delete order api
    app.delete('/orderedUsers/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const result = await orderedCollection.deleteOne(query);
        res.json(result)
    })
    

    // delete products api for admin 
    app.delete('/motorsAll/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await motorsCollection.deleteOne(query);
        res.json(result)
    })

    // post motors api
    app.post('/motorsAll', async(req, res)=>{
        const data = req.body;
        const result = await motorsCollection.insertOne(data);
        res.send('hi ai paici')
    })

    // post customer reviews api
    app.post('/customerReviews', async(req, res)=>{
        const customerReviews = req.body;
        const result = await reviewCollection.insertOne(customerReviews);
        res.json(result)
    })


    // users post api
    app.post('/users', async(req, res)=>{
        const users = req.body;
        const result = usersCollection.insertOne(users);
        res.json(result)
    })

    // users put api
    app.put('/users', async(req, res)=>{
        const users = req.body;
        const filter = {email:users.email};
        const options = {upsert:true};
        const updateDoc = {$set:users};
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result)
    })

    // users admin put api 
    app.put('/users/admin', async(req, res)=>{
        const admin = req.body;
        const filter = {email: admin.user};
        const updateDoc = {$set:{role:'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result)
    })

    // status put api
    app.put('/orderedUsers/state', async(req, res)=>{
        const state = req.body;
        // const query = {_id:ObjectId(id)}
        const filter = {_id:ObjectId(state.id)};
        const updateDoc = {$set:{status:state.status}};
        const result = await orderedCollection.updateOne(filter, updateDoc);
        res.json(result)
    })

}
finally{
    // client.close();   
}
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    console.log('Node Start'),
    res.send('Running my crud server')
})

app.listen(port, (req, res)=>{
    console.log('Running Server port is on')
})