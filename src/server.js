const express = require('express');
const PORT = process.env.PORT || 3001;
const scoreModel = require('./schema/Scores')
const app = express();
const cors = require('cors');

const connectDB = require('./database');
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

app.get('/scores', (req, res) => {
    console.log("doing a get")
    scoreModel.find()
        .sort({ score: -1 })
        .limit(10)
        .then(docs => {
            const rows = docs.map(d => `<li>${d.name}: ${d.score}</li>`).join('');
            res.send(`<ol>${rows}</ol>`);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('error');
        });
});

app.post('/scores', (req, res) => {
  // TODO: implement POST logic
  res.sendStatus(501); // Not Implemented
});

app.put('/scores', (req, res) => {
    let score = new scoreModel({
        name: req.body.name,
        score: req.body.score,
    })
    score.save()
	.then(doc => {
  	    console.log(doc.name + " added to the database")
	})
	.catch(err => {
  	    console.error(err)
	})
    res.send();
});

app.delete('/scores', (req, res) => {
  // TODO: implement DELETE logic
  res.sendStatus(501); // Not Implemented
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});