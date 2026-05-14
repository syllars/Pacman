const mongoose = require('mongoose');
const scoreModel = require('./schema/Scores')

const server = '127.0.0.1:27017';
const database = 'scores';  	// Since we made our schema into a model, this should be created

class Database {
  constructor() {
	this._connect()
  }

_connect() {
 	mongoose.connect(`mongodb://${server}/${database}`)
   	.then(testingSavingScore())
   	.catch(err => {
     	console.error('Database connection error')
   	})
  }
}

function testingSavingScore(){
    console.log('Database connection successful')

    let score = new scoreModel({
        name: "Sylvia",
        score: 1000,
    })
    score.save()
	.then(doc => {
  	    console.log("Name " + doc.name + " added to the database")
  	    console.log(doc)
	})
	.catch(err => {
  	    console.error(err)
	})
}

module.exports = new Database()
