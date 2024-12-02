const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require("axios");
const mysql = require('mysql2');
const cors = require('cors');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "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",
});


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const route = express.Router();
const port = process.env.PORT || 5001;app.use('/v1', route);
app.listen(port, () => {    
  console.log(`Server listening on port ${port}`);
});

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'food',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

app.get('/foods', (req,res) => {
  const sql = "SELECT * FROM foods";
  db.query(sql, (err, data) => {
    if(err) return res.json(err);
    return res.json(data);
  })
});

route.post('/delete-food', (req,res) => {
  const { id } = req.body;

  const query = 'DELETE FROM foods WHERE food_id = ?';

  db.query(query, [id], (err,result) => {
      if(err){
          return res.status(500).send('Error deleting recipe.');
      }
      res.status(200).send('Recipe deleted successfully.');
  })
})

route.post('/add-food', (req, res) => {
  const { food, ingredients } = req.body;

  const query = 'INSERT INTO foods (food_name, food_ingredients) VALUES (?, ?)';
  
  db.query(query, [food, ingredients], (err, result) => {
    if (err) {
      return res.status(500).send('Error adding recipe to the database.');
    }
    res.status(200).send('Recipe added successfully.');
  });
});

route.get('/get-recipe', async (req, res) => {
  try {
    const { ingredients } = req.query;

    const prompt = `Give me recipes with these ingredients: ${ingredients}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });
    res.send(response);

  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the recipe.");
  }
});