const express = require('express');
const app = express();

const cors = require('cors');
app.use( cors() ); // use cors package as 'middleware' (i.e. add cors - allow headers)

// app.use(express.json());
// app.use(express.urlencoded({ extended: true}));

//set-up basic server
// TODO: what is process.agrv[2]
const PORT = process.argv[2] || 3333;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});


const MongoClient = require('mongodb').MongoClient;
let db; // global car to story the db connection object


//set up MongoClient
// useNewUrlParser is required for Mongo setup
MongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true }, (err, client) => {
  if(err) return console.log(err); // early return on error
  db = client.db('finalProject'); //success
  // console.log(db);
});


app.get('/', (req, res) => {
  res.json({status: 'you reached the home page'});
})

// all participants
// TODO: why is toArray required
app.get('/participants', (req, res) => {
  db.collection('participants').find().toArray( (err, results) => {
    if(err){
      res.json({ error: err});
    } else {
      res.json( results );
    }
  });
});

//participant/:id
app.get('/participant/:id', (req, res) => {
  const participant = req.params.id;
  // res.json({status: `You reached participant, ${participant}`});
  db.collection('participants').findOne({ id: parseInt(participant) }, (err, result) => {
    if(err){
      res.json({ error: err });
    } else {
      res.json( result );
    }
  });
});

//follow-up list
app.get('/particpant ')



// all users


// user/id
