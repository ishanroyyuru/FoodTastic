require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const route = express.Router();
app.use('/v1', route);

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'food',
  port: 3306
});
db.connect(err => {
  if (err) console.error('DB connect error:', err.message);
  else console.log('Connected to MySQL');
});

app.get('/foods', (req, res) => {
  db.query("SELECT * FROM foods", (err, data) => {
    if (err) return res.json(err);
    res.json(data);
  });
});

route.post('/delete-food', (req, res) => {
  const { id } = req.body;
  db.query('DELETE FROM foods WHERE food_id = ?', [id], err => {
    if (err) return res.status(500).send('Error deleting recipe.');
    res.sendStatus(200);
  });
});

route.post('/add-food', (req, res) => {
  const { food, ingredients } = req.body;
  db.query(
    'INSERT INTO foods (food_name, food_ingredients) VALUES (?, ?)',
    [food, ingredients],
    err => {
      if (err) return res.status(500).send('Error adding recipe.');
      res.sendStatus(200);
    }
  );
});

route.get('/get-recipe', async (req, res) => {
  try {
    const { ingredients } = req.query;

    const prompt = `
You are a helpful assistant. Given a list of ingredients, return a JSON array of 3–5 recipes.

Each recipe must be an object with two fields:
- "name": a string (name of the dish)
- "ingredients": a string (list of ingredients used in the dish)

❗ Only respond with valid JSON. Do not include explanations, bullet points, or numbering.

Ingredients: ${ingredients}
`.trim();

    const gpt = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    res.send(gpt);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error fetching recipe.");
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server on ${port}`));
