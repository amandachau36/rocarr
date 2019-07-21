[
  {
    'id': 1,
    'name': 'bob',
    'email': 'bob@ga.co',
    'contactLog': [
      {
        'date': ISODate('2018-10-25T20:20:00Z'),
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
          'dateDue': ISODate('2018-10-31T20:20:00Z'),
          'assignTo': [
            {'email': 'jane@gc.co'},
          ],
          'openAssignment': false
        }
      },
      {
        'date': ISODate('2018-10-31T20:20:00Z'),
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



  {
    'id': 2,
    'name': 'Mary',
    'email': 'Mary@ga.co',
    'contactLog': [
      {
        'date': ISODate('2018-11-22T20:20:00Z'),
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
          'dateDue': ISODate('2018-11-30T20:20:00Z'),
          'assignTo': [
            {'email': 'jane@gc.co'},
            {'email': 'ruby@gc.co'}
          ]
        }
      },
      {
        'date': ISODate('2018-12-01T20:20:00Z'),
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
]
