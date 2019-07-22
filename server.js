const express = require('express');
const app = express();

const cors = require('cors');
app.use( cors() ); // use cors package as 'middleware' (i.e. add cors - allow headers)

// required for post request to work
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

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

//follow-up list
app.get('/participants/followup', (req, res) => {
  // take current user from passport

  // Find current user
  const currentUser = 'ruby@gc.co';
  // const currentUser = 'jane@gc.co';
  db.collection('participants').find({ $or: [
    {'contactLog.followUp.assignTo.email': currentUser },
    {'contactLog.followUp.openAssignment': true }
  ]}).toArray( (err, results) => {
    if(err){
      console.log('error');
      res.json({error: err})
    } else {
      console.log('all good');
      res.json( results )
    }
  });
});




//participant/search/:name
//** how do I anchor to the being of first or last name ***
app.get('/participants/search/:query', (req, res) => {
  let nameQuery = req.params.query;
  nameQuery = new RegExp(nameQuery);
  // this allows for a loose search which is also case 'i'nsensitive
  db.collection('participants').find({ name: { $regex: nameQuery, $options: 'i' } }).toArray( (err, results) => {
    if(err){
      res.json({ error: err});
    } else {
      res.json( results );
    }
  })
});


//participant/:id
app.get('/participant/:id', (req, res) => {
  const participant = parseInt(req.params.id);
  // res.json({status: `You reached participant, ${participant}`});
  db.collection('participants').findOne({ id: participant }, (err, result) => {
    if(err){
      res.json({ error: err });
    } else {
      res.json( result );
    }
  });
});



// create new contact log
app.post('/participant/:id/contact_log', (req, res) => {
  console.log('POST /participants: params')
  db.collection('participants').updateOne(

  //find the document to update using this participant id
  {id: parseInt(req.params.id) },
  {
    $push: { // apppend to contact log array
      contactLog:   {
        date: new Date('2011-04-11T10:20:30Z'),
        createdBy: {
          email: 'jane@ga.co',
          name: 'Jane',
          role: 'Genetic Counsellor'
        },
        interactionType: 'email',
        interactionReason: 'Initial contact',
        interactionDuration: 20,
        actionsTaken: [
          {AT1: 'Discussed research results'},
          {AT2: 'Discussed family implications'}
        ],
        documentsSentVia: 'email',
        documentsSent: [
          {D1: 'About ROCARR'},
          {D6: 'Interpreting results'},
          {D5: 'Implications for you and your family'}
        ],
        notes: 'Answered questions about',
        followUp: {
          actionsRequired: [
            {AR1: 'Referral'},
            {AR2: 'Follow-up call'},
          ],
          description: 'Send referral to Hunter Genetics',
          dateDue: new Date('2011-04-11T10:20:30Z'),
          assignTo: [
            {'email': 'jane@gc.co'},
          ],
          openAssignment: true
        }
      }  // end of contactLog
    } //end of push
  }, //end of second arguement
  (err, result) => {
    if(err) return res.json({ error: err });

    res.json({ status: 'success'})
  }

)// update

}); // post


// edit contact log



// create new participant


// edit participant



// No delete because this we need to keep all records in a research study


// all users index page
app.get('/users', (req, res) => {
  db.collection('users').find().toArray( (err, results) => {
    if(err){
      res.json({ error: err});
    } else {
      res.json( results );
    }
  });
});

// currentUser show page
app.get('/user/profile', (req, res) => {
  const currentUser = 'jane@gc.co'
  db.collection('users').findOne({ email: currentUser }, (err, result) => {
    if(err){
      res.json({error: err});
    } else {
      res.json( result )
    }
  })
})


// db.participants.find( { $or: [{'contactLog.followUp.assignTo.email': 'ruby@ga.co'}, {'contactLog.followUp.openAssignment': false }]} )
// db.participants.find( { $or: [{'contactLog.followUp.assignTo.email': 'ruby@gc.co'}, {'contactLog.followUp.openAssignment': false }]} ) // #works2
