import React, { useEffect } from 'react';
import './App.css'; // Importing the external CSS file
import { useState } from 'react';
import axios from 'axios';
import logo from './assets/foodtastic-logo.png';
import pastaPhoto from './assets/pasta_photo.webp';
import saladPhoto from './assets/salad_photo.jpeg';
import friesPhoto from './assets/fries_photo.jpg';
import OpenAI from 'openai';

function App() {
  const [data, setData] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/foods')
    .then(res => res.json())
    .then(data => setRecipes(data))
    .catch(err => console.log(err))
  }, [])


  const [food, setFood] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [chatGPT, setChatGPT] = useState('')
  const [response, setResponse] = useState('')

  
  function handleChange(e, target){
    if (target == "food") {
      setFood(e.target.value)
    } else if (target == "ingredients"){
      setIngredients(e.target.value)
    }
    else{
      setChatGPT(e.target.value)
    }
  };

  const handleAddRecipe = async() => {
    try{
        const newRecipe = {food, ingredients};
        setRecipes([...recipes, newRecipe]);  
        const res = await axios.post('http://localhost:5001/v1/add-food', newRecipe);

        const updatedRecipes = await axios.get('http://localhost:5001/foods');
        setRecipes(updatedRecipes.data);
        
        setFood('')
        setIngredients('')
        setResponse(res.data);
    } catch(error){
    }
    };

    const handleDeleteRecipe = async(id) => {
      const res = await axios.post('http://localhost:5001/v1/delete-food', {id});
      
      const updatedRecipes = await axios.get('http://localhost:5001/foods');
      setRecipes(updatedRecipes.data);
    };

    const handleChatGPT = async() =>  {
      try{
        const res = await axios.get('http://localhost:5001/v1/get-recipe', {
          params: { ingredients: chatGPT }
        });
        setResponse(res.data.choices[0].message.content);
      }
      catch(error){

      }
    }


  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1 className="title">Foodtastic</h1>
        </div>
      </header>

      <main className="main-content">
        <h2>Are you starving?</h2>
        <h3>Check out some of our recipes below!</h3>
        <div className="food-images">
          <img src={friesPhoto} alt="Food 3" className="food-img" />
          <img src={pastaPhoto} alt="Food 2" className="food-img" />
          <img src={saladPhoto} alt="Food 3" className="food-img" />
        </div>
      </main>

      <div className="recipes">
        <h1>Recipes</h1>

        <div className="food">
                <div>
                  <p>
                      <input type="text" value={food} onChange={(e) => handleChange(e, "food")} placeholder="Food Name" />
                  </p>
                  <p>
                      <input type="text" value={ingredients} onChange={(e) => handleChange(e, "ingredients")} placeholder="Ingredients" />
                  </p>
                </div>
                <button onClick={handleAddRecipe}>Add Recipe</button>
        </div>  

        <div className="foods">
          {recipes.map((recipe, index) => (
              <div className="food">
                <div>
                  <p style={{ fontWeight: "bold" }}>Food:</p>
                  <p>{recipe.food_name}</p>
                  <br />
                  <p style={{ fontWeight: "bold" }}>Ingredients:</p>
                  <p>{recipe.food_ingredients}</p>
                </div>
                <button onClick={() => handleDeleteRecipe(recipe.food_id)}>Remove</button>
              </div>
          ))}
        </div>
      </div>

      <div className="chatGPT">
          <h1>Recipes You Can Make</h1>
          <div>
            <p>
              <input type="text" value={chatGPT} onChange={(e) => handleChange(e, "chatGPT")} placeholder="Enter Your Ingredients" />
            </p>
          </div>
          <button onClick={handleChatGPT}>See Recipes</button>
          <div className="response-box">{response}</div>
      </div>
    </div>
  );
}

export default App;