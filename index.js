const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//------------------------------------------------------------------------------
//full code copy
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@project1.4j1y0pd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();



        // mongodb collection 
        const foodsCollection = client.db("meetBox").collection("addFood");
        const orderedCollection = client.db("meetBox").collection("orderedFood");

        //post operation of add a food item
        app.post("/addfoods", async (req, res) => {
            const newFood = req.body;
            const result = await foodsCollection.insertOne(newFood);
            res.send(result);

        });

        // read all foodItems data from mongo db
        app.get("/allfoods", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const searchText = req.query.search || ''; 
            console.log(page, size, searchText);
            
            const query = {};
        
            if (searchText) {
                query.foodName = { $regex: new RegExp(searchText, 'i') }; // 'i' 
            }
            
            const result = await foodsCollection.find(query)
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        });
        

        //find foodItems by email
        app.get('/addedfoods', async (req, res) => {
            try {
                let query = {};
                if (req.query.email) {
                    query = { addByEmail: req.query.email }; 
                }

                const result = await foodsCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        //fooItems count operation
        //get number of products
        app.get('/foodItemsCount', async (req, res) => {
            const count = await foodsCollection.estimatedDocumentCount();
            res.send({ count })
        })
        //food item get by id
        app.get('/allfoods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodsCollection.findOne(query);
            res.send(result);
        })
        //added food update
        app.put('/updateaddfood/:id',async(req,res)=>{
            const id = req.params.id;
            const updateInfo = req.body;
            console.log(updateInfo);
            const filter = {_id: new ObjectId(id)}
            const options = {upset:true};
            const updateData = {
                $set : {
                    foodName: updateInfo.foodName,
                    price: updateInfo.price,
                    foodCategory: updateInfo.foodCategory,
                    origin: updateInfo.origin,
                    quantity: updateInfo.quantity,
                    ratings: updateInfo.ratings,
                    photo: updateInfo.photo,
                    details: updateInfo.details
                },
            };
            const result = await foodsCollection.updateOne(filter, updateData, options);
            res.send(result);
        })

        //post ordered food info
        app.post('/orderedfoods', async (req, res) => {
            const orderedFoods = req.body;
            console.log(orderedFoods);
            const result = await orderedCollection.insertOne(orderedFoods);
            res.send(result);
        })

        //all orderedItems get
        app.get('/orders', async(req,res)=>{
            const query = {};
            const result = await orderedCollection.find(query).toArray();
            res.send(result);
        })

        //find orderedItems by email
        app.get('/orderFoods', async (req, res) => {
            try {
                console.log(req.query.email);
                let query = {};
                if (req.query?.email) {
                    query = { buyerEmail: req.query.email };
                }
                const result = await orderedCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });
        
        //delete order food item
        app.delete("/orderFoods/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await orderedCollection.deleteOne(query);
            res.send(result);
          })

         

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

//------------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("MeetBox Working");
});

app.listen(port, () => {
    console.log(`MeetBox Working on port ${port}`);
});