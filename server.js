const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

// const code_lookup = require('./lib/code_lookup')
// console.log(code_lookup);

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



// authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const jwt = require("jsonwebtoken");
// const passportJWT = require("passport-jwt");
// const extractJWT = passportJWT.ExtractJwt;
// const jwtStrategy = require('passport-jwt').Stragegy;
const jwtSecret = 'this should be in ENV';


app.use(passport.initialize());
app.use(passport.session());

//give Passport the User's email to store
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

//Fetch the user from the users database given an email
passport.deserializeUser(function(email, done) {
  db.collection('users')({ email: email }, (err, user) => done(err, user));
});







passport.use( new LocalStrategy(
  {
    //customization because using email instead of username
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    console.log('IN STRATEGY', email);


       // console.log('USER QUERY:', { email: email, password: hash });
       // look in users database for user's  email
       db.collection('users').findOne({ email: email}, (err, user) => {
         // return early if err
          if (err) { console.log('err!', err); return done(err); }
          // return if user is not found
          if (!user) {
             console.log('no user ERROR');
             return done(null, false, { message: 'Not a valid user.' });
           }

           // compare password enter and user's encrypted password
           bcrypt.compare(password, user.password, (err, success) => {

             console.log({err, success}, password, user.password);

              if( success ){
                console.log('all good????');


                return done(null, user);

              } else {
                console.log('wrong password!', err);
                return done(err);
              }

           }); // bcrypt.compare


       }); // db.collection

  } // strategy callback
)); //passport.user



app.post('/login',
  passport.authenticate(
    'local'
  // , { failureRedirect: '/loginxx' }
  ),
  function(req, res) {
    // console.log('res', res);
    console.log('res', req.user ); //, res.user);
    const user = req.user;
    //your_jwt_secret should be in ENV or somewhere secret
    const token = jwt.sign(user, 'your_jwt_secret');

    console.log('token', token);

    console.log('GOT HERE');
    res.json({status: 'success', token});
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

  console.log('POST /reservations: params:', req.body);

  const { date, interactionType, interactionReason, interactionDuration, actionsTaken, documentsSentVia, documentsSent, notes, followUpRequired, actionsRequired, description, dateDue, assignTo, openAssignment} = req.body;

  console.log('id', req.params.id);


  db.collection('participants').updateOne(

    //find the document to update using this participant id
    {id: parseInt(req.params.id) },
    {
      $push: { // apppend to contact log array
        contactLog:   {
          date: date,
          createdBy: {
            email: 'jane@ga.co',
            name: 'Jane',
            role: 'Genetic Counsellor'
          },
          interactionType: interactionType,
          interactionReason: interactionReason,
          interactionDuration: interactionDuration,
          actionsTaken: actionsTaken,
          documentsSentVia: documentsSentVia,
          documentsSent: documentsSent,
          notes: notes,
          followUp: {
            actionsRequired: actionsRequired,
            description: description,
            dateDue: dateDue,
            assignTo: assignTo,
            openAssignment: openAssignment
          }
        }  // end of contactLog
      } //end of push
    }, //end of second arguement
    (err, result) => {
      if(err) return res.json({ error: err });
      console.log('update results :', result );
      res.json({ status: 'success'})
    }

  )// update

}); // post




 // delete follow up

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
});



// db.participants.find( { $or: [{'contactLog.followUp.assignTo.email': 'ruby@ga.co'}, {'contactLog.followUp.openAssignment': false }]} )
// db.participants.find( { $or: [{'contactLog.followUp.assignTo.email': 'ruby@gc.co'}, {'contactLog.followUp.openAssignment': false }]} ) // #works2


//
//  usersCreate(req, res) {
//   console.log('hello userCreate controller');
//   // console.log(req.db);
//   console.log(req.body);
//   const password = req.body.password;
// ​
// ​
//   bcrypt.hash(password, saltRounds, function(err, hash) {
//    // Store hash in your password DB.
//    req.db.collection('users').insert({name: req.body.name, email: req.body.username, password: hash})
//   });
// ​
//  }
