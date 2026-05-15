const express = require('express');
const PORT = process.env.PORT || 3001;
const scoreModel = require('./schema/Scores')
const app = express();
const cors = require('cors');

const connectDB = require('./database');
connectDB();

app.use(express.json());
app.use(cors());

app.get('/scores', (req, res) => {
    console.log("doing a get")
    scoreModel.find()
        .sort({ score: -1 })
        .limit(10)
        .then(docs => {
            const rows = docs.map(d => `<li>${d.name}: ${d.score}</li>`).join('');
            res.send(`<h2>LEADERBOARD</h2><ol>${rows}</ol>`);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('error');
        });
});

app.post('/scores', (req, res) => {
  res.sendStatus(501);
});

app.put('/scores', (req, res) => {
    let score = new scoreModel({
        name: req.body.name,
        score: req.body.score,
    })
    score.save()
	.then(doc => {
  	    console.log(doc.name + " added to the database")
        res.sendStatus(200);
	})
	.catch(err => {
  	    console.error(err)
        res.status(500).send('error');
	})
    //res.send();
});

app.delete('/scores', (req, res) => {
  res.sendStatus(501);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});