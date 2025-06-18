import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

import logo       from './assets/foodtastic-logo.png';
import pastaPhoto from './assets/pasta_photo.webp';
import saladPhoto from './assets/salad_photo.jpeg';
import friesPhoto from './assets/fries_photo.jpg';

export default function App() {
  const [recipes, setRecipes]               = useState([]);
  const [food, setFood]                     = useState('');
  const [ingredients, setIngr]              = useState('');
  const [chatInput, setChat]                = useState('');
  const [response, setResponse]             = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [activeTab, setActiveTab]           = useState('home');

  useEffect(() => {
    refreshRecipes();
  }, []);

  async function refreshRecipes() {
    try {
      const res = await axios.get('http://localhost:5001/foods');
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleChange = (e, t) => {
    const v = e.target.value;
    if (t === 'food')        setFood(v);
    if (t === 'ingredients') setIngr(v);
    if (t === 'chat')        setChat(v);
  };

  const addRecipe = async () => {
    if (!food.trim() || !ingredients.trim()) return;
    try {
      await axios.post('http://localhost:5001/v1/add-food', {
        food: food.trim(),
        ingredients: ingredients.trim()
      });
      await refreshRecipes();
      setFood(''); setIngr('');
    } catch (err) {
      console.error(err);
    }
  };

  const delRecipe = async id => {
    try {
      await axios.post('http://localhost:5001/v1/delete-food', { id });
      await refreshRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  const chat = async () => {
    try {
      const res = await axios.get('http://localhost:5001/v1/get-recipe', {
        params: { ingredients: chatInput }
      });
      const raw = res.data.choices[0].message.content.trim();
      setResponse(raw);

      try {
        const parsed = JSON.parse(raw);
        console.log("Parsed GPT Response:", parsed);
        if (Array.isArray(parsed)) {
          setSuggestedRecipes(parsed);
        } else {
          setSuggestedRecipes([]);
        }
      } catch {
        setSuggestedRecipes([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSuggestion = async (recipe) => {
    if (!recipe.name || !recipe.ingredients) return;
    try {
      await axios.post('http://localhost:5001/v1/add-food', {
        food: recipe.name,
        ingredients: recipe.ingredients
      });
      await refreshRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container brand">
          <img src={logo} alt="Foodtastic logo" />
          <h1>Foodtastic</h1>
        </div>
        <nav className="navbar">
          <ul className="nav-list">
            <li
              className={`nav-item ${activeTab==='home'? 'active':''}`}
              onClick={()=>setActiveTab('home')}
            >Home</li>
            <li
              className={`nav-item ${activeTab==='recipes'? 'active':''}`}
              onClick={()=>setActiveTab('recipes')}
            >Recipes</li>
          </ul>
        </nav>
      </header>

      {activeTab==='home' && (
        <>
          <section className="section hero">
            <div className="container hero-inner">
              <h2 className="hero-title">The Best Recipe Generator</h2>
              <p className="hero-sub">
                Don't know what to make, we got you!
              </p>
              <button className="btn-grad" onClick={()=>setActiveTab('recipes')}>
                Explore Menu
              </button>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <h3 className="section-title">Featured Dishes</h3>
              <div className="grid imgs">
                {[friesPhoto,pastaPhoto,saladPhoto].map((src,i)=>(
                  <div key={i} className="img-card">
                    <img src={src} alt={`dish-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <h3 className="section-title">Chef Assistant</h3>
              <input
                className="chat-input"
                placeholder="Enter your ingredients…"
                value={chatInput}
                onChange={e=>handleChange(e,'chat')}
              />
              <button className="btn-grad" onClick={chat}>See Recipes</button>

                <div className="response-box">
                  {suggestedRecipes.length > 0
                    ? suggestedRecipes.map((r, i) => (
                        <div key={i}>
                          <strong>{r.name}</strong><br />
                          <span>{r.ingredients}</span><br /><br />
                        </div>
                      ))
                    : (response || 'Ask me anything about cooking…')}
                </div>

              {suggestedRecipes.length > 0 && (
                <div className="grid cards" style={{ marginTop: '1rem' }}>
                  {suggestedRecipes.map((r, i) => (
                    <div key={i} className="card suggestion-card">
                      <h4>{r.name}</h4>
                      <p>{r.ingredients}</p>
                      <button className="btn-grad" onClick={() => saveSuggestion(r)}>
                        Add to Database
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab==='recipes' && (
        <section className="section">
          <div className="container">
            <h3 className="section-title">Recipes</h3>

            <div className="recipe-form card">
              <input
                placeholder="Food name"
                value={food}
                onChange={e=>handleChange(e,'food')}
              />
              <input
                placeholder="Ingredients"
                value={ingredients}
                onChange={e=>handleChange(e,'ingredients')}
              />
              <button className="btn-grad" onClick={addRecipe}>
                Add Recipe
              </button>
            </div>

            <div className="grid cards">
              {recipes.map(r=>(
                <div key={r.food_id} className="card recipe-card">
                  <h4>{r.food_name}</h4>
                  <p>{r.food_ingredients}</p>
                  <button onClick={()=>delRecipe(r.food_id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
