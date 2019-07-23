

const MongoClient = require('mongodb').MongoClient;
let db; // global var to store the db connection object

MongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true }, (err, client) => {

  if(err) return console.log(err); // early return on error
  // no block required if really short


  const dbName = process.env['DB_NAME'] || 'finalProject';
  console.log({dbName});
  db = client.db(dbName); //success

  // drop all participants first, and then in callback, call seedParticipants()

  db.collection('participants').remove( {}, {}, seedParticipants  );
  db.collection('users').remove( {}, {}, seedUsers  );

}); // connect


const seedParticipants = (err, res) => {

    if( err ){
      console.log('ERROR', err);
      process.exit(1);
    }

    db.collection('participants').insertMany(
      [
        {
          'id': 1,
          'name': 'bob',
          'email': 'bob@ga.co',
          'contactLog': [
            {
              'date': new Date('2011-04-11T10:20:30Z'),
              'createdBy': {
                'email': 'jane@gc.co',
                'name': 'Jane',
                'role': 'Genetic Counsellor'
              },
              'interactionType': 'email',
              'interactionReason': 'Initial contact',
              'interactionDuration': 20,
              'actionsTaken': [
                {'AT1': 'Discussed research results'},
                {'AT2': 'Discussed family implications'}
              ],
              'documentsSentVia': 'email',
              'documentsSent': [
                {'D1': 'About ROCARR'},
                {'D6': 'Interpreting results'},
                {'D5': 'Implications for you and your family'}
              ],
              'notes': 'Answered questions about',
              'followUp': {
                'actionsRequired': [
                  {'AR1': 'Referral'},
                  {'AR2': 'Follow-up call'},
                ],
                'description': 'Send referral to Hunter Genetics',
                'dateDue': new Date('2011-04-11T10:20:30Z'),
                'assignTo': [
                  {'email': 'jane@gc.co'},
                ],
                'openAssignment': false
              }
            },  // end of contactLog #1
            {
              'date': new Date('2011-04-11T10:20:30Z'),
              'createdBy': {
                'email': 'jane@gc.co',
                'name': 'Jane',
                'role': 'Genetic Counsellor'
              },
              'interactionType': 'phone',
              'interactionReason': 'Referral',
              'interactionDuration': 30,
              'actionsTaken': [
                {'AT4': 'Referred participant'}
              ],
              'documentsSentVia': 'None',
              'notes': 'Answered questions about',
              'followUp': 'No'
            }
          ]
        },


        //////////////////////////////////////////////// doc 2
        {
          'id': 2,
          'name': 'Mary',
          'email': 'Mary@ga.co',
          'contactLog': [
            {
              'date': new Date('2011-04-11T10:20:30Z'),
              'createdBy': {
                'email': 'jane@gc.co',
                'name': 'Jane',
                'role': 'Genetic Counsellor'
              },
              'interactionType': 'phone',
              'interactionReason': 'Initial contact',
              'interactionDuration': 45,
              'actionsTaken': [
                {'AT1': 'Discussed research results'},
                {'AT3': 'Discussed referral options'}
              ],
              'documentsSentVia': 'email',
              'documentsSent': [
                {'D6': 'Interpreting results'},
                {'D5': 'Implications for you and your family'},
                {'D4': 'Privacy, security, and data sharing'}
              ],
              'notes': 'Answered questions about',
              'followUp': {
                'actionRequired': [
                  {'AR1': 'Referral'},
                  {'AR2': 'Follow-up call'}
                ],
                'description': 'Send referral to Hunter Genetics',
                'dateDue': new Date('2011-04-11T10:20:30Z'),
                'assignTo': [
                  {'email': 'jane@gc.co'},
                  {'email': 'ruby@gc.co'}
                ]
              }
            },
            {
              'date': new Date('2011-04-11T10:20:30Z'),
              'createdBy': {
                'email': 'ruby@gc.co',
                'name': 'Ruby',
                'role': 'Genetic Counsellor'
              },
              'interactionType': 'phone',
              'interactionReason': 'Referral',
              'interactionDuration': 30,
              'actionsTaken': [
                {'AT4': 'Referred participant'}
              ],
              'documentsSentVia': 'None',
              'notes': 'Answered questions about',
              'followUp': 'No'
            }
          ]
        }
      ],
      (err, result) => {
        if( err ){
          console.log('ERROR adding participants', err);
          return process.exit(1);
        }
        console.log(`Seeded ${result.insertedCount} participants.`);

      }
    );
};

const seedUsers = () => {
  db.collection('users').insertMany(
    [
      {
        'name': 'Jane',
        'email': 'jane@gc.co',
        'password': '$2b$10$BNx.duKXgp5Q5P1Rv5R3C.Q8841rF7suR6WkF2001Fa8fyz2UDJsm',
        'role': 'Genetic Counsellor'
      },
      {
        'name': 'Ruby',
        'email': 'ruby@gc.co',
        'password': '$2b$10$1z0KlCbd4yi3GpbtYkM.YOgZVGl54fpjBxa/aErZC9HpjRrn2fTIW',
        'role': 'Genetic Counsellor'
      },
      {
        'name': 'Pat',
        'email': 'pat@eval.co',
        'password': '$2b$10$TXF1t6RVIijZrPH5bObmpOqyUySNCxhiBSaAIMoB.AT21L2IcdDe.',
        'role': 'Evaluator'
      }
    ],
    (err, result) => {
      if( err ){
        console.log('ERROR adding users', err);
        return process.exit(1);
      }
      console.log(`Seeded ${result.insertedCount} users.`);
    }
  );
};



// "seed-participants": "mongoimport --db ROCARR --collection participants --drop --jsonArray --file participant-seeds.js",
// "seed-users": "mongoimport --db ROCARR --collection users --drop --jsonArray --file user-seeds.js"


// These work!
// db.participants.find( {'contactLog.createdBy.email': 'ruby@gc.co' } )
// db.participants.find( {'contactLog.followUp': {$exists:true}})
// db.participants.find( {'contactLog.followUp.description': 'Send referral to Hunter Genetics' })
// db.participants.find( {'contactLog.followUp.assignTo.email': 'ruby@gc.co' }). *** yay!! Can find follow-ups!
// db.participants.find( {'contactLog.followUp.openAssignment': false }) *** yay also works


// to encrypt and salt password for seeds
// in terminal/ node
// b = require('bcrypt')
// b.hash('chicken', 10, (err, hash) => console.log(err, hash))
