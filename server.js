const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwtSecret = 'this should be in ENV';


// const socketIO = require('socket.io');
// const http = require('http');
// const port = 4001;
// const chatServer = http.createServer(app);

// const io = socketIO(chatServer);

const PORT = process.argv[2] || 3333;

var server = require('http').Server(app);
const io = require('socket.io')(server);

const sharedServer = server.listen(PORT, () =>{
  console.log('Listening for HTTP connections on port ' + PORT);
});


// middleware for websocket connection: check token if present
io.use((socket, next) => {

  let token = socket.handshake.query.token;

  if(token){

    const payload = jwt.verify(token, jwtSecret);
    console.log({payload});

    db.collection('users').findOne({'_id': new ObjectID(payload.id)}, (err, user) => {
      if (err) {
        console.log("err from JWT socket handshake user find:", err);
        // return done(err, false);
        return next(err);
      }
      if (user) {
        console.log('Success from JWT socket handshake user', user);
        // return done(null, user);
        socket.user = user;
        return next();
      } else {
        console.log('not sure what this is but it failed');
        // return done(null, false);
        return next(new Error('authentication error, unknown (invalid user ID?)'));

      }
    });


  } else {
    // User is not logged in, i.e. assume they are a participant
    socket.user = null;
  }

  return next();
  // if (isValid(token)) {
  //   return next();
  // }
  // return next(new Error('authentication error'));
});


io.on('connection', (socket) => {

  // need to authenicate

  console.log('got connection', socket.handshake.query.token, socket.user);

  if(socket.user){
    // Sockets with valid users are understood to be logged-in counsellors
    // They should be made to join a room with all other counsellors, so
    // they can be notified when a participant wants to start a chat
    // (and then they can join the participant's room automatically)

    console.log('======================== Counsellor connected:', socket.id);
    socket.join('counsellors-lounge');

    // setInterval(()=> {
    //   socket.emit('ping', {content: true});
    // }, 2000);

  } else {

    // Socket belongs to a participant, so tell counsellors about it
    // and have them join the room for this participant
    io.to('counsellors-lounge').emit('participant-joined', {
       id: socket.id
    });

    console.log('+++++++++++++ Participant connected', socket.id);

    // Notify anyone who joins this participant's room
    // when someone joins it
    io.of('/').in(socket.id).on('join', data => {
      console.log('Counsellor joined!', data);
    });


    // console.log(io.of('/'));

    // Get the IDs of all the counsellors currently connected
    const counsellorsLounge = io.nsps['/'].adapter.rooms['counsellors-lounge'];
    console.log('who is in the counsellors Lounge?', counsellorsLounge);



    // io.of('/').in('counsellors-lounge').clients((error, clients) => {
    //   if (error) throw error;
    //   console.log('clients:', clients);
    //
    //   // Use each ID to get to socket for that counsellor,
    //   // and make them join the room for this pariticipant
    //   clients.forEach( id => {
    //     const counsellorSocket = io.of('/').connected[id];
    //     counsellorSocket.join(socket.id);
    //     console.log(`Counsellor ${id} joined room ${socket.id}`);
    //   });

    // });

  } // participant connection



});

// io.to('some room').emit('some event');




// const code_lookup = require('./lib/code_lookup')
// console.log(code_lookup);

const cors = require('cors');
app.use( cors() ); // use cors package as 'middleware' (i.e. add cors - allow headers)

// required for post request to work
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


//set-up basic server
// TODO: what is process.agrv[2]
// app.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`);
// });


const {MongoClient, ObjectID} = require('mongodb');
let db; // global car to story the db connection object


//set up MongoClient
// useNewUrlParser is required for Mongo setup
// ''
MongoClient.connect(`mongodb+srv://AmandaChau:${ ATLAS_PASSWORD }@cluster0-g1ymh.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true }, (err, client) => {
  if(err) return console.log(err); // early return on error
  db = client.db('finalProject'); //success
  // console.log(db);
});



// authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const jwt = require("jsonwebtoken");
const passportJWT = require("passport-jwt");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;



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

//local
passport.use( new LocalStrategy(
  {
    //customization because using email instead of username
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    // console.log('IN STRATEGY', email);
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
                console.log('all good - auth/login sucessful ');

                return done(null, user);

              } else {
                console.log('wrong password!', err);
                return done(err);
              }

           }); // bcrypt.compare


       }); // db.collection

  } // strategy callback
)); //passport.user


// POST /login - use local strategy above and generate JWT token if successful
app.post('/login', passport.authenticate('local'), (req, res) => {

    console.log('res', req.user ); //, res.user);
    const user = req.user;

    // only save _id in
    const token = jwt.sign({ id: user._id }, jwtSecret);

    console.log('token', token);

    console.log('GOT HERE');
    res.json({
      email: user.email,
      status: 'success',
      token
    });
});


//use jwtStrategy to determing if user has a valid JWT token
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtSecret;
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  console.log('hello from JWT STrategy');
  console.log('*******jwt_payload:', jwt_payload);
    db.collection('users').findOne({'_id': new ObjectID(jwt_payload.id)}, (err, user) => {
        if (err) {
            console.log("err from JWT strategy:", err);
            return done(err, false);
        }
        if (user) {
            console.log('Success from JWT Strategy', user);
            return done(null, user);
        } else {
            console.log('not sure what this is but it failed');
            return done(null, false);

        }
    });
}));




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


//find follow-up list for each user how who is logged in
// is next for catching errors?????
app.get('/participants/followup', passport.authenticate('jwt'), (req, res, next) => {
  //take current user from passport

  //authorization
  console.log('passport.auth(JWT) worked');
  // console.log('req', req);
  // res.json({ status: 'success'});

  // Find current user
  console.log("req.user.email", req.user.email);
  const currentUser = req.user.email;
  // const currentUser = 'jane@gc.co';


  db.collection('participants').find(
    {
      $or: [
        {'contactLog.followUp.assignTo': currentUser },
        {'contactLog.followUp.openAssignment': true }
      ]
    }
    // Projection:
    // { contactLog: }
  ).toArray( (err, results) => {
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
app.get('/participants/search/:query', passport.authenticate('jwt'), (req, res, next) => {

  let nameQuery = req.params.query;
  console.log(nameQuery);
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
app.get('/participant/:id', passport.authenticate('jwt'), (req, res, next) => {

  const participant = parseInt(req.params.id);
  console.log("hello from /participant/:id", participant)
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
app.post('/participant/:id/contact_log', passport.authenticate('jwt'), (req, res, next) => {
//


  console.log('POST /reservations: params:', req.body);

  const { date, interactionType, interactionReason, interactionDuration, actionsTaken, documentsSentVia, documentsSent, notes, followUpRequired, actionsRequired, description, dateDue, assignTo, openAssignment} = req.body;

  console.log('id', req.params.id);


  const newLog = { // apppend to contact log array
    contactLog:   {
      date: date,
      createdBy: {
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
      interactionType: interactionType,
      interactionReason: interactionReason,
      interactionDuration: interactionDuration,
      actionsTaken: [actionsTaken],
      documentsSentVia: [documentsSentVia],
      documentsSent: documentsSent,
      notes: notes,
      followUp: {
        actionsRequired: [actionsRequired],
        description: description,
        dateDue: dateDue,
        assignTo: [assignTo],
        openAssignment: openAssignment
      }
    }  // end of contactLog
  };

  db.collection('participants').updateOne(
    //find the document to update using this participant id
    {id: parseInt(req.params.id) },

    { $push: newLog },

    (err, result) => {
      if(err) return res.json({ error: err });
      console.log('update results :', result );
      console.log('newLog', newLog);
      res.json({ status: 'success', newContactLog: newLog })
    }

  )// update

}); // post



// create new participant


// edit participant





// No delete because this we need to keep all records in a research study

//Create new user
// this works but ?callback hell and need to do something with err
// salt and encrypt password prior to saving

app.post('/user', (req, res) => {
  console.log('you reached POST /user');
  console.log( req.body );
  const { name, email, password, role} = req.body;
  db.collection('users').findOne({ email: email}, (err, user) => {

    if (user) {
      // return early account already exists
      return res.json({ error: "This email already has an account" })
    } else {
      console.log('create new account')
      db.collection('users').insertOne({ name: name, email: email, password: password, role: role })
        .then( result => res.json({ status: `success - creating new account with _id: ${result.insertedId}`}))
        .catch( error => console.error(`Failed to insert item: ${error}`));

    }

  }); // db.collection

});





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
