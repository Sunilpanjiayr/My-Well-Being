// src/components/features/healthyRecipes/HealthyRecipes.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './HealthyRecipes.css';

function HealthyRecipes() {
  const { darkMode } = useTheme();
  
  // Core state
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeView, setActiveView] = useState('browse');
  
  // User data state
  const [favorites, setFavorites] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [cookedRecipes, setCookedRecipes] = useState([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietType, setSelectedDietType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  
  // Modal state
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecipeForm, setNewRecipeForm] = useState({
    title: '',
    description: '',
    ingredients: [{ amount: '', unit: '', name: '' }],
    instructions: [''],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: 'main',
    dietType: ['balanced'],
    difficulty: 'medium',
    image: null,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [calculatorForm, setCalculatorForm] = useState({
    gender: 'female',
    age: '',
    weight: '',
    height: '',
    activity: 'sedentary',
    goal: 'maintain',
  });
  const [calculatorResults, setCalculatorResults] = useState({
    bmr: 0,
    maintenance: 0,
    recommended: 0,
  });
  const [nutritionInfo, setNutritionInfo] = useState([
    {
      id: 1,
      title: 'Understanding Macronutrients ',
      content: 'Proteins, carbohydrates, and fats are essential macronutrients.',
      expandedContent: 'Proteins, carbohydrates, and fats are the three macronutrients your body needs in large amounts. Proteins support muscle repair, carbs provide energy, and fats aid in hormone production.',
      expanded: false,
      icon: '⚖️'
    },
    {
      id: 2,
      title: 'The Importance of Fiber',
      content: 'Dietary fiber promotes digestive health and fullness.',
      expandedContent: 'Dietary fiber promotes digestive health, helps maintain healthy cholesterol and blood sugar levels, and can aid in weight management by keeping you feeling full longer.',
      expanded: false,
      icon: '🌱'
    },
    {
      id: 3,
      title: 'Hydration and Health',
      content: 'Proper hydration supports bodily functions.',
      expandedContent: 'Staying properly hydrated is essential for regulating temperature, supporting digestion, nutrient absorption, and maintaining overall health.',
      expanded: false,
      icon: '💧'
    },
    {
      id: 4,
      title: 'Micronutrients: Vitamins and Minerals',
      content: 'Micronutrients support growth and immunity.',
      expandedContent: 'Vitamins and minerals are needed in smaller amounts but are vital for growth, immune function, brain development, and other critical processes.',
      expanded: false,
      icon: '💊'
    },
    {
      id: 5,
      title: 'Mindful Eating Practices',
      content: 'Mindful eating enhances your eating experience.',
      expandedContent: 'Mindful eating involves being present, recognizing hunger and fullness cues, and savoring each bite to improve your relationship with food.',
      expanded: false,
      icon: '🍽️'
    },
  ]);

  // Categories, Diet Types, etc.
  const categories = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'lunch', label: 'Lunch', icon: '🥪' },
    { id: 'dinner', label: 'Dinner', icon: '🍲' },
    { id: 'snack', label: 'Snacks', icon: '🍌' },
    { id: 'dessert', label: 'Desserts', icon: '🍰' },
    { id: 'drink', label: 'Drinks', icon: '🥤' },
    { id: 'salad', label: 'Salads', icon: '🥗' },
    { id: 'soup', label: 'Soups', icon: '🍜' },
    { id: 'main', label: 'Main Dishes', icon: '🍱' },
    { id: 'side', label: 'Side Dishes', icon: '🥔' },
  ];

  const dietTypes = [
    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥕' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'paleo', label: 'Paleo', icon: '🍖' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'low-carb', label: 'Low Carb', icon: '🥦' },
    { id: 'high-protein', label: 'High Protein', icon: '💪' },
    { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy Free', icon: '🥛' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  ];

  const difficultyLevels = [
    { id: 'easy', label: 'Easy', icon: '😌' },
    { id: 'medium', label: 'Medium', icon: '😊' },
    { id: 'hard', label: 'Hard', icon: '😓' },
  ];

  const weekDays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'lunch', label: 'Lunch', icon: '🥪' },
    { id: 'dinner', label: 'Dinner', icon: '🍲' },
    { id: 'snack', label: 'Snack', icon: '🍌' },
  ];

  const seasonalCollections = [
    {
      id: 'summer2023',
      title: 'Summer Refreshers 2023',
      description: 'Light and refreshing recipes perfect for hot summer days.',
      image: 'summer-collection.jpg',
      recipes: [6, 11, 20, 31, 38, 42, 47],
    },
    {
      id: 'fall2023',
      title: 'Fall Harvest 2023',
      description: 'Warm, comforting recipes featuring autumn produce.',
      image: 'fall-collection.jpg',
      recipes: [4, 9, 15, 24, 32, 40, 48],
    },
    {
      id: 'winter2023',
      title: 'Winter Warmers 2023',
      description: 'Hearty and nutritious recipes to keep you warm in winter.',
      image: 'winter-collection.jpg',
      recipes: [5, 7, 19, 26, 39, 41, 49],
    },
  ];

  const cookingTips = [
    {
      id: 1,
      title: 'Meal Prep Basics',
      content: 'Dedicate 1-2 hours on Sunday to prepare staples like cooked grains, roasted vegetables, and protein.',
      icon: '⏱️',
    },
    {
      id: 2,
      title: 'Knife Skills',
      content: 'A sharp knife is safer than a dull one. Learn basic cutting techniques for efficiency.',
      icon: '🔪',
    },
    {
      id: 3,
      title: 'Flavor Boosters',
      content: 'Use herbs, spices, citrus, and vinegars to add flavor without extra calories.',
      icon: '🌿',
    },
    {
      id: 4,
      title: 'Portion Control',
      content: 'Use smaller plates and fill half with vegetables for balanced meals.',
      icon: '🍽️',
    },
    {
      id: 5,
      title: 'Reading Food Labels',
      content: 'Choose foods with whole, recognizable ingredients and minimal added sugars.',
      icon: '🏷️',
    },
  ];

  // Sample Recipes (expanded with more recipes)
  const sampleRecipes = [
    {
      id: 1,
      title: 'Grilled Chicken Salad',
      description: 'A refreshing salad with grilled chicken and mixed greens.',
      ingredients: [
        { amount: 2, unit: 'cups', name: 'mixed greens' },
        { amount: 1, unit: 'breast', name: 'chicken' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
        { amount: 0.25, unit: 'cup', name: 'cherry tomatoes, halved' },
        { amount: 0.5, unit: '', name: 'cucumber, sliced' },
      ],
      instructions: ['Grill chicken.', 'Toss greens with olive oil.', 'Combine and serve.'],
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      calories: 300,
      protein: 25,
      carbs: 10,
      fat: 15,
      category: 'salad',
      dietType: ['balanced', 'high-protein'],
      difficulty: 'easy',
      image: 'chicken-salad.jpg',
      dateAdded: '2025-04-01',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 2,
      title: 'Vegan Quinoa Bowl',
      description: 'A hearty bowl with quinoa, veggies, and avocado.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'quinoa' },
        { amount: 1, unit: '', name: 'avocado' },
        { amount: 2, unit: 'cups', name: 'mixed vegetables' },
        { amount: 2, unit: 'tbsp', name: 'lemon juice' },
        { amount: 1, unit: 'tbsp', name: 'tahini' },
      ],
      instructions: ['Cook quinoa.', 'Chop vegetables.', 'Assemble bowl.'],
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 15,
      category: 'main',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'medium',
      image: 'quinoa-bowl.jpg',
      dateAdded: '2025-04-05',
      rating: 4.0,
      reviews: [],
    },
    {
      id: 3,
      title: 'Avocado Toast',
      description: 'Simple and nutritious avocado toast with a sprinkle of chili flakes.',
      ingredients: [
        { amount: 2, unit: 'slices', name: 'whole-grain bread' },
        { amount: 1, unit: '', name: 'avocado' },
        { amount: 1, unit: 'tsp', name: 'lemon juice' },
        { amount: 0.25, unit: 'tsp', name: 'chili flakes' },
        { amount: 1, unit: 'pinch', name: 'sea salt' },
      ],
      instructions: ['Toast bread.', 'Mash avocado with lemon juice.', 'Spread on toast, sprinkle with chili flakes and salt.'],
      prepTime: 5,
      cookTime: 5,
      servings: 2,
      calories: 200,
      protein: 5,
      carbs: 20,
      fat: 12,
      category: 'breakfast',
      dietType: ['vegetarian', 'vegan'],
      difficulty: 'easy',
      image: 'avocado-toast.jpg',
      dateAdded: '2025-03-15',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 4,
      title: 'Lentil Soup',
      description: 'Hearty lentil soup with carrots and spices.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'green lentils' },
        { amount: 2, unit: 'cups', name: 'vegetable broth' },
        { amount: 1, unit: '', name: 'carrot, diced' },
        { amount: 1, unit: '', name: 'onion, chopped' },
        { amount: 1, unit: 'tsp', name: 'cumin' },
      ],
      instructions: ['Sauté onion.', 'Add carrots, lentils, broth, cumin.', 'Simmer 30 minutes.'],
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      calories: 180,
      protein: 10,
      carbs: 30,
      fat: 2,
      category: 'soup',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'lentil-soup.jpg',
      dateAdded: '2025-02-20',
      rating: 4.3,
      reviews: [],
    },
    {
      id: 5,
      title: 'Keto Salmon with Asparagus',
      description: 'Baked salmon with roasted asparagus, perfect for a low-carb diet.',
      ingredients: [
        { amount: 2, unit: 'fillets', name: 'salmon' },
        { amount: 1, unit: 'bunch', name: 'asparagus' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'garlic powder' },
        { amount: 1, unit: 'pinch', name: 'salt' },
      ],
      instructions: ['Preheat oven to 400°F.', 'Toss asparagus with oil, garlic.', 'Bake salmon and asparagus 15 minutes.'],
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      calories: 400,
      protein: 35,
      carbs: 5,
      fat: 28,
      category: 'dinner',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'easy',
      image: 'salmon-asparagus.jpg',
      dateAdded: '2025-01-10',
      rating: 4.8,
      reviews: [],
    },
    {
      id: 6,
      title: 'Berry Smoothie',
      description: 'A quick and refreshing berry smoothie.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'mixed berries' },
        { amount: 1, unit: '', name: 'banana' },
        { amount: 1, unit: 'cup', name: 'almond milk' },
        { amount: 1, unit: 'tbsp', name: 'chia seeds' },
      ],
      instructions: ['Blend all ingredients.', 'Serve chilled.'],
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 220,
      protein: 5,
      carbs: 35,
      fat: 8,
      category: 'drink',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'berry-smoothie.jpg',
      dateAdded: '2025-03-01',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 7,
      title: 'Paleo Pork Stir-Fry',
      description: 'A flavorful pork stir-fry with colorful veggies.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'pork strips' },
        { amount: 2, unit: 'cups', name: 'bell peppers, sliced' },
        { amount: 1, unit: 'cup', name: 'broccoli florets' },
        { amount: 2, unit: 'tbsp', name: 'coconut aminos' },
        { amount: 1, unit: 'tbsp', name: 'coconut oil' },
      ],
      instructions: ['Heat oil, cook beef.', 'Add veggies, aminos.', 'Stir-fry 10 minutes.'],
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      category: 'main',
      dietType: ['paleo', 'gluten-free'],
      difficulty: 'medium',
      image: 'pork-stir-fry.jpg',
      dateAdded: '2025-02-15',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 8,
      title: 'Greek Yogurt Parfait',
      description: 'Layered yogurt with granola and fruit.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'Greek yogurt' },
        { amount: 0.5, unit: 'cup', name: 'granola' },
        { amount: 0.5, unit: 'cup', name: 'mixed berries' },
        { amount: 1, unit: 'tbsp', name: 'honey' },
      ],
      instructions: ['Layer yogurt, granola, berries.', 'Drizzle with honey.'],
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 250,
      protein: 15,
      carbs: 35,
      fat: 8,
      category: 'breakfast',
      dietType: ['vegetarian'],
      difficulty: 'easy',
      image: 'yogurt-parfait.jpg',
      dateAdded: '2025-04-10',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 9,
      title: 'Chickpea Curry',
      description: 'Spicy chickpea curry with coconut milk.',
      ingredients: [
        { amount: 1, unit: 'can', name: 'chickpeas' },
        { amount: 1, unit: 'cup', name: 'coconut milk' },
        { amount: 1, unit: 'tbsp', name: 'curry powder' },
        { amount: 1, unit: '', name: 'onion, chopped' },
        { amount: 2, unit: 'cloves', name: 'garlic' },
      ],
      instructions: ['Sauté onion, garlic.', 'Add chickpeas, curry, coconut milk.', 'Simmer 20 minutes.'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 300,
      protein: 10,
      carbs: 35,
      fat: 15,
      category: 'main',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'medium',
      image: 'chickpea-curry.jpg',
      dateAdded: '2025-03-20',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 10,
      title: 'Baked Sweet Potato Fries',
      description: 'Crispy sweet potato fries with a touch of paprika.',
      ingredients: [
        { amount: 2, unit: '', name: 'sweet potatoes' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'paprika' },
        { amount: 0.5, unit: 'tsp', name: 'salt' },
      ],
      instructions: ['Preheat oven to 425°F.', 'Cut potatoes, toss with oil, paprika.', 'Bake 25 minutes.'],
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      calories: 150,
      protein: 2,
      carbs: 25,
      fat: 5,
      category: 'side',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'sweet-potato-fries.jpg',
      dateAdded: '2025-02-25',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 11,
      title: 'Mediterranean Hummus Wrap',
      description: 'A fresh wrap filled with hummus and veggies.',
      ingredients: [
        { amount: 1, unit: '', name: 'whole-grain wrap' },
        { amount: 0.25, unit: 'cup', name: 'hummus' },
        { amount: 0.5, unit: 'cup', name: 'cucumber, sliced' },
        { amount: 0.25, unit: 'cup', name: 'feta cheese' },
        { amount: 0.5, unit: 'cup', name: 'spinach' },
      ],
      instructions: ['Spread hummus on wrap.', 'Add veggies, feta.', 'Roll and serve.'],
      prepTime: 10,
      cookTime: 0,
      servings: 1,
      calories: 300,
      protein: 10,
      carbs: 40,
      fat: 12,
      category: 'lunch',
      dietType: ['vegetarian', 'mediterranean'],
      difficulty: 'easy',
      image: 'hummus-wrap.jpg',
      dateAdded: '2025-03-05',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 12,
      title: 'Almond Butter Energy Balls',
      description: 'No-bake energy balls for a quick snack.',
      ingredients: [
        { amount: 0.5, unit: 'cup', name: 'almond butter' },
        { amount: 1, unit: 'cup', name: 'rolled oats' },
        { amount: 0.25, unit: 'cup', name: 'honey' },
        { amount: 0.25, unit: 'cup', name: 'chocolate chips' },
      ],
      instructions: ['Mix all ingredients.', 'Roll into balls.', 'Chill 30 minutes.'],
      prepTime: 15,
      cookTime: 0,
      servings: 12,
      calories: 100,
      protein: 3,
      carbs: 12,
      fat: 5,
      category: 'snack',
      dietType: ['vegetarian', 'gluten-free'],
      difficulty: 'easy',
      image: 'energy-balls.jpg',
      dateAdded: '2025-04-15',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 13,
      title: 'Zucchini Noodles with Pesto',
      description: 'Light zucchini noodles tossed in homemade pesto.',
      ingredients: [
        { amount: 2, unit: '', name: 'zucchinis' },
        { amount: 0.5, unit: 'cup', name: 'basil leaves' },
        { amount: 0.25, unit: 'cup', name: 'pine nuts' },
        { amount: 0.25, unit: 'cup', name: 'olive oil' },
        { amount: 1, unit: 'clove', name: 'garlic' },
      ],
      instructions: ['Spiralize zucchini.', 'Blend basil, nuts, oil, garlic.', 'Toss noodles with pesto.'],
      prepTime: 15,
      cookTime: 0,
      servings: 2,
      calories: 250,
      protein: 5,
      carbs: 10,
      fat: 22,
      category: 'main',
      dietType: ['vegetarian', 'keto'],
      difficulty: 'medium',
      image: 'zucchini-noodles.jpg',
      dateAdded: '2025-03-25',
      rating: 4.3,
      reviews: [],
    },
    {
      id: 14,
      title: 'Banana Oat Pancakes',
      description: 'Fluffy pancakes made with oats and bananas.',
      ingredients: [
        { amount: 2, unit: '', name: 'bananas' },
        { amount: 1, unit: 'cup', name: 'rolled oats' },
        { amount: 2, unit: '', name: 'eggs' },
        { amount: 1, unit: 'tsp', name: 'baking powder' },
      ],
      instructions: ['Blend ingredients.', 'Cook batter on skillet.', 'Serve with fruit.'],
      prepTime: 10,
      cookTime: 10,
      servings: 2,
      calories: 200,
      protein: 8,
      carbs: 30,
      fat: 6,
      category: 'breakfast',
      dietType: ['vegetarian', 'gluten-free'],
      difficulty: 'easy',
      image: 'banana-pancakes.jpg',
      dateAdded: '2025-02-10',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 15,
      title: 'Tomato Basil Soup',
      description: 'Creamy tomato soup with fresh basil.',
      ingredients: [
        { amount: 4, unit: '', name: 'tomatoes' },
        { amount: 0.5, unit: 'cup', name: 'basil leaves' },
        { amount: 1, unit: 'cup', name: 'vegetable broth' },
        { amount: 0.25, unit: 'cup', name: 'cream' },
        { amount: 1, unit: '', name: 'onion' },
      ],
      instructions: ['Sauté onion.', 'Add tomatoes, broth.', 'Simmer, blend with basil, cream.'],
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      calories: 180,
      protein: 4,
      carbs: 15,
      fat: 10,
      category: 'soup',
      dietType: ['vegetarian'],
      difficulty: 'medium',
      image: 'tomato-soup.jpg',
      dateAdded: '2025-01-20',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 16,
      title: 'Cauliflower Rice Bowl',
      description: 'Low-carb bowl with cauliflower rice and veggies.',
      ingredients: [
        { amount: 1, unit: 'head', name: 'cauliflower' },
        { amount: 1, unit: 'cup', name: 'black beans' },
        { amount: 0.5, unit: 'cup', name: 'corn' },
        { amount: 1, unit: 'tbsp', name: 'lime juice' },
        { amount: 1, unit: 'tsp', name: 'chili powder' },
      ],
      instructions: ['Rice cauliflower.', 'Sauté with beans, corn.', 'Season with lime, chili.'],
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      calories: 200,
      protein: 8,
      carbs: 25,
      fat: 5,
      category: 'main',
      dietType: ['vegan', 'low-carb'],
      difficulty: 'easy',
      image: 'cauliflower-rice.jpg',
      dateAdded: '2025-04-20',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 17,
      title: 'Baked Cod with Lemon',
      description: 'Light cod fillets baked with lemon and herbs.',
      ingredients: [
        { amount: 2, unit: 'fillets', name: 'cod' },
        { amount: 1, unit: '', name: 'lemon' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'dried thyme' },
        { amount: 0.5, unit: 'tsp', name: 'salt' },
      ],
      instructions: ['Preheat oven to 375°F.', 'Season cod, drizzle with oil, lemon.', 'Bake 20 minutes.'],
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      calories: 250,
      protein: 30,
      carbs: 2,
      fat: 14,
      category: 'dinner',
      dietType: ['paleo', 'keto'],
      difficulty: 'easy',
      image: 'baked-cod.jpg',
      dateAdded: '2025-03-30',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 18,
      title: 'Mango Chia Pudding',
      description: 'Sweet mango pudding with chia seeds.',
      ingredients: [
        { amount: 0.25, unit: 'cup', name: 'chia seeds' },
        { amount: 1, unit: 'cup', name: 'coconut milk' },
        { amount: 1, unit: '', name: 'mango, diced' },
        { amount: 1, unit: 'tbsp', name: 'maple syrup' },
      ],
      instructions: ['Mix chia, milk, syrup.', 'Chill 4 hours.', 'Top with mango.'],
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      calories: 200,
      protein: 5,
      carbs: 25,
      fat: 10,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'chia-pudding.jpg',
      dateAdded: '2025-02-28',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 19,
      title: 'Turkey Meatballs',
      description: 'Lean turkey meatballs with marinara.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'ground turkey' },
        { amount: 0.25, unit: 'cup', name: 'breadcrumbs' },
        { amount: 1, unit: '', name: 'egg' },
        { amount: 1, unit: 'cup', name: 'marinara sauce' },
        { amount: 1, unit: 'tsp', name: 'Italian seasoning' },
      ],
      instructions: ['Mix turkey, breadcrumbs, egg, seasoning.', 'Form balls, bake 20 minutes.', 'Serve with sauce.'],
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      calories: 280,
      protein: 25,
      carbs: 15,
      fat: 12,
      category: 'main',
      dietType: ['high-protein'],
      difficulty: 'medium',
      image: 'turkey-meatballs.jpg',
      dateAdded: '2025-01-15',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 20,
      title: 'Kale Smoothie',
      description: 'Nutrient-packed smoothie with kale and pineapple.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'kale' },
        { amount: 0.5, unit: 'cup', name: 'pineapple chunks' },
        { amount: 1, unit: '', name: 'banana' },
        { amount: 1, unit: 'cup', name: 'almond milk' },
      ],
      instructions: ['Blend all ingredients.', 'Serve immediately.'],
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 3,
      category: 'drink',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'kale-smoothie.jpg',
      dateAdded: '2025-04-25',
      rating: 4.3,
      reviews: [],
    },
    {
      id: 21,
      title: 'Stuffed Bell Peppers',
      description: 'Bell peppers stuffed with quinoa and black beans.',
      ingredients: [
        { amount: 4, unit: '', name: 'bell peppers' },
        { amount: 1, unit: 'cup', name: 'quinoa, cooked' },
        { amount: 1, unit: 'cup', name: 'black beans' },
        { amount: 0.5, unit: 'cup', name: 'salsa' },
        { amount: 1, unit: 'tsp', name: 'cumin' },
      ],
      instructions: ['Hollow peppers.', 'Mix quinoa, beans, salsa, cumin.', 'Stuff peppers, bake 30 minutes.'],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      calories: 220,
      protein: 10,
      carbs: 40,
      fat: 3,
      category: 'main',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'medium',
      image: 'stuffed-peppers.jpg',
      dateAdded: '2025-03-10',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 22,
      title: 'Coconut Rice',
      description: 'Fragrant coconut rice as a side dish.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'jasmine rice' },
        { amount: 1, unit: 'cup', name: 'coconut milk' },
        { amount: 1, unit: 'cup', name: 'water' },
        { amount: 0.5, unit: 'tsp', name: 'salt' },
      ],
      instructions: ['Rinse rice.', 'Cook with coconut milk, water, salt.', 'Fluff and serve.'],
      prepTime: 5,
      cookTime: 20,
      servings: 4,
      calories: 200,
      protein: 4,
      carbs: 35,
      fat: 5,
      category: 'side',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'coconut-rice.jpg',
      dateAdded: '2025-02-05',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 23,
      title: 'Egg Muffins',
      description: 'Portable egg muffins with veggies.',
      ingredients: [
        { amount: 6, unit: '', name: 'eggs' },
        { amount: 0.5, unit: 'cup', name: 'spinach, chopped' },
        { amount: 0.25, unit: 'cup', name: 'bell pepper, diced' },
        { amount: 0.25, unit: 'cup', name: 'cheddar cheese' },
      ],
      instructions: ['Whisk eggs.', 'Mix in veggies, cheese.', 'Bake in muffin tin 20 minutes.'],
      prepTime: 10,
      cookTime: 20,
      servings: 6,
      calories: 100,
      protein: 8,
      carbs: 2,
      fat: 7,
      category: 'breakfast',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'easy',
      image: 'egg-muffins.jpg',
      dateAdded: '2025-04-30',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 24,
      title: 'Apple Crisp',
      description: 'Warm apple dessert with oat topping.',
      ingredients: [
        { amount: 4, unit: '', name: 'apples' },
        { amount: 0.5, unit: 'cup', name: 'rolled oats' },
        { amount: 0.25, unit: 'cup', name: 'almond flour' },
        { amount: 2, unit: 'tbsp', name: 'maple syrup' },
        { amount: 2, unit: 'tbsp', name: 'coconut oil' },
      ],
      instructions: ['Slice apples.', 'Mix oats, flour, syrup, oil.', 'Bake 30 minutes.'],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      calories: 220,
      protein: 3,
      carbs: 35,
      fat: 10,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'apple-crisp.jpg',
      dateAdded: '2025-03-15',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 25,
      title: 'Shrimp Tacos',
      description: 'Spicy shrimp tacos with cabbage slaw.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'shrimp' },
        { amount: 4, unit: '', name: 'corn tortillas' },
        { amount: 1, unit: 'cup', name: 'cabbage, shredded' },
        { amount: 1, unit: 'tbsp', name: 'lime juice' },
        { amount: 1, unit: 'tsp', name: 'chili powder' },
      ],
      instructions: ['Cook shrimp with chili powder.', 'Mix cabbage, lime.', 'Assemble tacos.'],
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      calories: 250,
      protein: 20,
      carbs: 25,
      fat: 8,
      category: 'dinner',
      dietType: ['gluten-free'],
      difficulty: 'easy',
      image: 'shrimp-tacos.jpg',
      dateAdded: '2025-02-20',
      rating: 4.8,
      reviews: [],
    },
    {
      id: 26,
      title: 'Mushroom Risotto',
      description: 'Creamy risotto with mushrooms.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'arborio rice' },
        { amount: 2, unit: 'cups', name: 'mushrooms, sliced' },
        { amount: 4, unit: 'cups', name: 'vegetable broth' },
        { amount: 0.25, unit: 'cup', name: 'parmesan' },
        { amount: 1, unit: '', name: 'onion' },
      ],
      instructions: ['Sauté onion, mushrooms.', 'Add rice, broth gradually.', 'Stir in parmesan.'],
      prepTime: 10,
      cookTime: 40,
      servings: 4,
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 8,
      category: 'main',
      dietType: ['vegetarian', 'gluten-free'],
      difficulty: 'hard',
      image: 'mushroom-risotto.jpg',
      dateAdded: '2025-01-25',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 27,
      title: 'Peanut Butter Cookies',
      description: 'Simple three-ingredient cookies.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'peanut butter' },
        { amount: 0.5, unit: 'cup', name: 'sugar' },
        { amount: 1, unit: '', name: 'egg' },
      ],
      instructions: ['Mix ingredients.', 'Shape cookies.', 'Bake 10 minutes.'],
      prepTime: 10,
      cookTime: 10,
      servings: 12,
      calories: 100,
      protein: 4,
      carbs: 8,
      fat: 7,
      category: 'dessert',
      dietType: ['gluten-free'],
      difficulty: 'easy',
      image: 'peanut-cookies.jpg',
      dateAdded: '2025-04-05',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 28,
      title: 'Roasted Brussels Sprouts',
      description: 'Crispy Brussels sprouts with balsamic glaze.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'Brussels sprouts' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tbsp', name: 'balsamic vinegar' },
        { amount: 0.5, unit: 'tsp', name: 'salt' },
      ],
      instructions: ['Toss sprouts with oil, salt.', 'Roast 25 minutes.', 'Drizzle with balsamic.'],
      prepTime: 10,
      cookTime: 25,
      servings: 4,
      calories: 120,
      protein: 4,
      carbs: 15,
      fat: 6,
      category: 'side',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'brussels-sprouts.jpg',
      dateAdded: '2025-03-20',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 29,
      title: 'Tofu Stir-Fry',
      description: 'Crispy tofu with veggies in soy sauce.',
      ingredients: [
        { amount: 1, unit: 'block', name: 'tofu' },
        { amount: 2, unit: 'cups', name: 'mixed vegetables' },
        { amount: 2, unit: 'tbsp', name: 'soy sauce' },
        { amount: 1, unit: 'tbsp', name: 'sesame oil' },
        { amount: 1, unit: 'tsp', name: 'ginger, grated' },
      ],
      instructions: ['Fry tofu.', 'Add veggies, soy sauce, ginger.', 'Cook 10 minutes.'],
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      calories: 220,
      protein: 12,
      carbs: 15,
      fat: 12,
      category: 'main',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'medium',
      image: 'tofu-stir-fry.jpg',
      dateAdded: '2025-02-15',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 30,
      title: 'Overnight Oats',
      description: 'Easy oats with fruit for breakfast.',
      ingredients: [
        { amount: 0.5, unit: 'cup', name: 'rolled oats' },
        { amount: 0.5, unit: 'cup', name: 'almond milk' },
        { amount: 0.25, unit: 'cup', name: 'berries' },
        { amount: 1, unit: 'tbsp', name: 'chia seeds' },
      ],
      instructions: ['Mix oats, milk, chia.', 'Chill overnight.', 'Top with berries.'],
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 200,
      protein: 6,
      carbs: 30,
      fat: 7,
      category: 'breakfast',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'overnight-oats.jpg',
      dateAdded: '2025-04-10',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 31,
      title: 'Caprese Salad',
      description: 'Classic salad with tomatoes and mozzarella.',
      ingredients: [
        { amount: 2, unit: '', name: 'tomatoes' },
        { amount: 1, unit: 'cup', name: 'mozzarella balls' },
        { amount: 0.25, unit: 'cup', name: 'basil leaves' },
        { amount: 2, unit: 'tbsp', name: 'balsamic vinegar' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
      ],
      instructions: ['Slice tomatoes, mozzarella.', 'Layer with basil.', 'Drizzle with oil, vinegar.'],
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      calories: 200,
      protein: 10,
      carbs: 8,
      fat: 15,
      category: 'salad',
      dietType: ['vegetarian', 'gluten-free'],
      difficulty: 'easy',
      image: 'caprese-salad.jpg',
      dateAdded: '2025-03-05',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 32,
      title: 'Pumpkin Soup',
      description: 'Creamy pumpkin soup for fall.',
      ingredients: [
        { amount: 2, unit: 'cups', name: 'pumpkin puree' },
        { amount: 1, unit: 'cup', name: 'coconut milk' },
        { amount: 1, unit: 'cup', name: 'vegetable broth' },
        { amount: 1, unit: 'tsp', name: 'nutmeg' },
        { amount: 1, unit: '', name: 'onion' },
      ],
      instructions: ['Sauté onion.', 'Add puree, broth, nutmeg.', 'Simmer, blend with milk.'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 150,
      protein: 3,
      carbs: 15,
      fat: 8,
      category: 'soup',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'medium',
      image: 'pumpkin-soup.jpg',
      dateAdded: '2025-02-25',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 33,
      title: 'Grilled Veggie Skewers',
      description: 'Colorful veggie skewers for the grill.',
      ingredients: [
        { amount: 1, unit: '', name: 'zucchini' },
        { amount: 1, unit: '', name: 'bell pepper' },
        { amount: 1, unit: 'cup', name: 'mushrooms' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'rosemary' },
      ],
      instructions: ['Chop veggies.', 'Skewer, brush with oil, rosemary.', 'Grill 10 minutes.'],
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      calories: 100,
      protein: 2,
      carbs: 8,
      fat: 7,
      category: 'side',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'veggie-skewers.jpg',
      dateAdded: '2025-04-15',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 34,
      title: 'Chicken Lettuce Wraps',
      description: 'Light wraps with spicy chicken filling.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'ground chicken' },
        { amount: 8, unit: 'leaves', name: 'lettuce' },
        { amount: 2, unit: 'tbsp', name: 'hoisin sauce' },
        { amount: 1, unit: 'tbsp', name: 'soy sauce' },
        { amount: 0.5, unit: 'cup', name: 'carrots, shredded' },
      ],
      instructions: ['Cook chicken with sauces.', 'Spoon into lettuce.', 'Top with carrots.'],
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      calories: 220,
      protein: 20,
      carbs: 10,
      fat: 12,
      category: 'lunch',
      dietType: ['gluten-free'],
      difficulty: 'easy',
      image: 'lettuce-wraps.jpg',
      dateAdded: '2025-03-30',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 35,
      title: 'Chocolate Avocado Mousse',
      description: 'Rich vegan chocolate mousse.',
      ingredients: [
        { amount: 2, unit: '', name: 'avocados' },
        { amount: 0.25, unit: 'cup', name: 'cocoa powder' },
        { amount: 0.25, unit: 'cup', name: 'maple syrup' },
        { amount: 0.5, unit: 'tsp', name: 'vanilla extract' },
      ],
      instructions: ['Blend all ingredients.', 'Chill 1 hour.', 'Serve.'],
      prepTime: 10,
      cookTime: 0,
      servings: 4,
      calories: 200,
      protein: 3,
      carbs: 20,
      fat: 15,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'chocolate-mousse.jpg',
      dateAdded: '2025-02-10',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 36,
      title: 'Vegetable Frittata',
      description: 'Baked egg dish with mixed vegetables.',
      ingredients: [
        { amount: 6, unit: '', name: 'eggs' },
        { amount: 1, unit: 'cup', name: 'mixed vegetables' },
        { amount: 0.25, unit: 'cup', name: 'cheddar cheese' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
      ],
      instructions: ['Sauté veggies.', 'Whisk eggs, pour over veggies.', 'Bake 20 minutes.'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 180,
      protein: 12,
      carbs: 5,
      fat: 12,
      category: 'breakfast',
      dietType: ['vegetarian', 'keto'],
      difficulty: 'medium',
      image: 'frittata.jpg',
      dateAdded: '2025-04-20',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 37,
      title: 'Spaghetti Squash Alfredo',
      description: 'Low-carb Alfredo with spaghetti squash.',
      ingredients: [
        { amount: 1, unit: '', name: 'spaghetti squash' },
        { amount: 0.5, unit: 'cup', name: 'heavy cream' },
        { amount: 0.25, unit: 'cup', name: 'parmesan' },
        { amount: 1, unit: 'clove', name: 'garlic' },
      ],
      instructions: ['Bake squash.', 'Make sauce with cream, parmesan, garlic.', 'Toss with squash strands.'],
      prepTime: 15,
      cookTime: 45,
      servings: 4,
      calories: 250,
      protein: 8,
      carbs: 15,
      fat: 18,
      category: 'main',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'medium',
      image: 'spaghetti-squash.jpg',
      dateAdded: '2025-03-25',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 38,
      title: 'Cucumber Mint Water',
      description: 'Refreshing infused water.',
      ingredients: [
        { amount: 0.5, unit: '', name: 'cucumber' },
        { amount: 10, unit: 'leaves', name: 'mint' },
        { amount: 4, unit: 'cups', name: 'water' },
      ],
      instructions: ['Slice cucumber.', 'Add cucumber, mint to water.', 'Chill 1 hour.'],
      prepTime: 5,
      cookTime: 0,
      servings: 4,
      calories: 5,
      protein: 0,
      carbs: 1,
      fat: 0,
      category: 'drink',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'cucumber-water.jpg',
      dateAdded: '2025-02-20',
      rating: 4.3,
      reviews: [],
    },
    {
      id: 39,
      title: 'Pork Tenderloin with Apples',
      description: 'Savory pork with sweet apples.',
      ingredients: [
        { amount: 1, unit: 'lb', name: 'pork tenderloin' },
        { amount: 2, unit: '', name: 'apples' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'rosemary' },
      ],
      instructions: ['Sear pork.', 'Add sliced apples, rosemary.', 'Bake 25 minutes.'],
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      calories: 300,
      protein: 30,
      carbs: 15,
      fat: 12,
      category: 'dinner',
      dietType: ['paleo'],
      difficulty: 'medium',
      image: 'pork-tenderloin.jpg',
      dateAdded: '2025-01-30',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 40,
      title: 'Carrot Ginger Soup',
      description: 'Warming soup with carrots and ginger.',
      ingredients: [
        { amount: 4, unit: '', name: 'carrots' },
        { amount: 1, unit: 'tbsp', name: 'ginger, grated' },
        { amount: 2, unit: 'cups', name: 'vegetable broth' },
        { amount: 0.5, unit: 'cup', name: 'coconut milk' },
      ],
      instructions: ['Cook carrots, ginger in broth.', 'Blend with coconut milk.', 'Serve hot.'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      calories: 150,
      protein: 3,
      carbs: 15,
      fat: 8,
      category: 'soup',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'carrot-soup.jpg',
      dateAdded: '2025-04-25',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 41,
      title: 'Baked Chicken Thighs',
      description: 'Juicy chicken thighs with herbs.',
      ingredients: [
        { amount: 4, unit: '', name: 'chicken thighs' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tsp', name: 'paprika' },
        { amount: 1, unit: 'tsp', name: 'garlic powder' },
      ],
      instructions: ['Season chicken.', 'Bake at 400°F for 35 minutes.', 'Serve.'],
      prepTime: 10,
      cookTime: 35,
      servings: 4,
      calories: 300,
      protein: 25,
      carbs: 0,
      fat: 20,
      category: 'dinner',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'easy',
      image: 'chicken-thighs.jpg',
      dateAdded: '2025-03-15',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 42,
      title: 'Fruit Salad',
      description: 'Colorful fruit salad with honey-lime dressing.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'strawberries' },
        { amount: 1, unit: 'cup', name: 'pineapple chunks' },
        { amount: 1, unit: 'cup', name: 'blueberries' },
        { amount: 1, unit: 'tbsp', name: 'honey' },
        { amount: 1, unit: 'tbsp', name: 'lime juice' },
      ],
      instructions: ['Chop fruit.', 'Mix honey, lime juice.', 'Toss with fruit.'],
      prepTime: 10,
      cookTime: 0,
      servings: 4,
      calories: 100,
      protein: 1,
      carbs: 25,
      fat: 0,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'fruit-salad.jpg',
      dateAdded: '2025-02-10',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 43,
      title: 'Beet Salad',
      description: 'Earthy beet salad with goat cheese.',
      ingredients: [
        { amount: 4, unit: '', name: 'beets' },
        { amount: 0.25, unit: 'cup', name: 'goat cheese' },
        { amount: 2, unit: 'cups', name: 'arugula' },
        { amount: 2, unit: 'tbsp', name: 'walnuts' },
        { amount: 1, unit: 'tbsp', name: 'balsamic vinegar' },
      ],
      instructions: ['Roast beets.', 'Toss with arugula, cheese, walnuts.', 'Drizzle with vinegar.'],
      prepTime: 15,
      cookTime: 45,
      servings: 4,
      calories: 200,
      protein: 6,
      carbs: 15,
      fat: 12,
      category: 'salad',
      dietType: ['vegetarian', 'gluten-free'],
      difficulty: 'medium',
      image: 'beet-salad.jpg',
      dateAdded: '2025-04-30',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 44,
      title: 'Lentil Patties',
      description: 'Savory lentil patties for burgers or bowls.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'lentils, cooked' },
        { amount: 0.25, unit: 'cup', name: 'breadcrumbs' },
        { amount: 1, unit: '', name: 'egg' },
        { amount: 1, unit: 'tsp', name: 'cumin' },
      ],
      instructions: ['Mix ingredients.', 'Form patties.', 'Cook 10 minutes per side.'],
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      calories: 180,
      protein: 10,
      carbs: 25,
      fat: 5,
      category: 'main',
      dietType: ['vegetarian'],
      difficulty: 'medium',
      image: 'lentil-patties.jpg',
      dateAdded: '2025-03-20',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 45,
      title: 'Matcha Latte',
      description: 'Creamy matcha latte with almond milk.',
      ingredients: [
        { amount: 1, unit: 'tsp', name: 'matcha powder' },
        { amount: 1, unit: 'cup', name: 'almond milk' },
        { amount: 1, unit: 'tbsp', name: 'honey' },
        { amount: 0.25, unit: 'cup', name: 'hot water' },
      ],
      instructions: ['Whisk matcha with water.', 'Heat milk, add honey.', 'Combine.'],
      prepTime: 5,
      cookTime: 5,
      servings: 1,
      calories: 100,
      protein: 2,
      carbs: 15,
      fat: 3,
      category: 'drink',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'matcha-latte.jpg',
      dateAdded: '2025-02-15',
      rating: 4.4,
      reviews: [],
    },
    {
      id: 46,
      title: 'Pesto Grilled Chicken',
      description: 'Chicken breasts with basil pesto.',
      ingredients: [
        { amount: 2, unit: '', name: 'chicken breasts' },
        { amount: 0.25, unit: 'cup', name: 'pesto' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
        { amount: 0.5, unit: 'tsp', name: 'salt' },
      ],
      instructions: ['Coat chicken with pesto, oil.', 'Grill 15 minutes.', 'Serve.'],
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      calories: 350,
      protein: 35,
      carbs: 2,
      fat: 20,
      category: 'dinner',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'easy',
      image: 'pesto-chicken.jpg',
      dateAdded: '2025-04-05',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 47,
      title: 'Quinoa Salad',
      description: 'Fresh quinoa salad with veggies.',
      ingredients: [
        { amount: 1, unit: 'cup', name: 'quinoa' },
        { amount: 0.5, unit: 'cup', name: 'cucumber, diced' },
        { amount: 0.5, unit: 'cup', name: 'cherry tomatoes' },
        { amount: 2, unit: 'tbsp', name: 'olive oil' },
        { amount: 1, unit: 'tbsp', name: 'lemon juice' },
      ],
      instructions: ['Cook quinoa.', 'Mix with veggies, oil, lemon.', 'Chill and serve.'],
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      calories: 200,
      protein: 6,
      carbs: 30,
      fat: 8,
      category: 'salad',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'quinoa-salad.jpg',
      dateAdded: '2025-03-10',
      rating: 4.6,
      reviews: [],
    },
    {
      id: 48,
      title: 'Baked Apples',
      description: 'Warm apples with cinnamon and nuts.',
      ingredients: [
        { amount: 4, unit: '', name: 'apples' },
        { amount: 0.25, unit: 'cup', name: 'walnuts' },
        { amount: 2, unit: 'tbsp', name: 'maple syrup' },
        { amount: 1, unit: 'tsp', name: 'cinnamon' },
      ],
      instructions: ['Core apples.', 'Fill with nuts, syrup, cinnamon.', 'Bake 30 minutes.'],
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      calories: 180,
      protein: 2,
      carbs: 30,
      fat: 6,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'baked-apples.jpg',
      dateAdded: '2025-02-25',
      rating: 4.5,
      reviews: [],
    },
    {
      id: 49,
      title: 'Spinach Stuffed Chicken',
      description: 'Chicken breasts stuffed with spinach and cheese.',
      ingredients: [
        { amount: 2, unit: '', name: 'chicken breasts' },
        { amount: 1, unit: 'cup', name: 'spinach' },
        { amount: 0.25, unit: 'cup', name: 'mozzarella' },
        { amount: 1, unit: 'tbsp', name: 'olive oil' },
      ],
      instructions: ['Stuff chicken with spinach, cheese.', 'Sear, then bake 25 minutes.', 'Serve.'],
      prepTime: 15,
      cookTime: 25,
      servings: 2,
      calories: 350,
      protein: 40,
      carbs: 2,
      fat: 20,
      category: 'dinner',
      dietType: ['keto', 'gluten-free'],
      difficulty: 'medium',
      image: 'stuffed-chicken.jpg',
      dateAdded: '2025-04-15',
      rating: 4.7,
      reviews: [],
    },
    {
      id: 50,
      title: 'Berry Crisp',
      description: 'Warm dessert with a crunchy oat topping.',
      ingredients: [
        { amount: 2, unit: 'cups', name: 'mixed berries' },
        { amount: 0.5, unit: 'cup', name: 'rolled oats' },
        { amount: 0.25, unit: 'cup', name: 'almond flour' },
        { amount: 2, unit: 'tbsp', name: 'maple syrup' },
        { amount: 2, unit: 'tbsp', name: 'coconut oil' },
        { amount: 1, unit: 'tsp', name: 'cinnamon' },
      ],
      instructions: ['Place berries in dish.', 'Mix oats, flour, syrup, oil, cinnamon.', 'Bake 30 minutes.'],
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      calories: 200,
      protein: 4,
      carbs: 28,
      fat: 9,
      category: 'dessert',
      dietType: ['vegan', 'gluten-free'],
      difficulty: 'easy',
      image: 'berry-crisp.jpg',
      dateAdded: '2025-04-30',
      rating: 4.7,
      reviews: [],
    },
  ];


  // Load data from localStorage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedData = localStorage.getItem('healthyRecipesData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFavorites(parsedData.favorites || []);
        setMealPlan(parsedData.mealPlan || {});
        setShoppingList(parsedData.shoppingList || []);
        setCookedRecipes(parsedData.cookedRecipes || []);
      }
      setRecipes(sampleRecipes);
      setFilteredRecipes(sampleRecipes);
    };
    
    loadSavedData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const saveData = () => {
      const dataToSave = { favorites, mealPlan, shoppingList, cookedRecipes };
      localStorage.setItem('healthyRecipesData', JSON.stringify(dataToSave));
    };
    
    saveData();
  }, [favorites, mealPlan, shoppingList, cookedRecipes]);

  // Filter recipes based on search terms and filters
  const filterRecipes = useCallback(() => {
    let filtered = [...recipes];
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }
    
    // Apply diet type filter
    if (selectedDietType && selectedDietType !== 'all') {
      filtered = filtered.filter((recipe) => recipe.dietType.includes(selectedDietType));
    }
    
    // Apply difficulty filter
    if (selectedDifficulty && selectedDifficulty !== 'all') {
      filtered = filtered.filter((recipe) => recipe.difficulty === selectedDifficulty);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        break;
      case 'topRated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'preparationTime':
        filtered.sort((a, b) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime));
        break;
      case 'calories':
        filtered.sort((a, b) => a.calories - b.calories);
        break;
      case 'protein':
        filtered.sort((a, b) => b.protein - a.protein);
        break;
      default:
        break;
    }
    
    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, selectedCategory, selectedDietType, selectedDifficulty, sortOption]);

  // Apply filtering when filter criteria change
  useEffect(() => {
    filterRecipes();
  }, [filterRecipes, searchTerm, selectedCategory, selectedDietType, selectedDifficulty, sortOption, recipes]);

  // Recipe action handlers
  const toggleFavorite = (recipeId) => {
    setFavorites((prev) => 
      prev.includes(recipeId) 
        ? prev.filter((id) => id !== recipeId) 
        : [...prev, recipeId]
    );
  };

  const addToMealPlan = (recipeId, day, mealType) => {
    setMealPlan(prev => {
      const updatedMealPlan = { ...prev };
      if (!updatedMealPlan[day]) updatedMealPlan[day] = {};
      if (!updatedMealPlan[day][mealType]) updatedMealPlan[day][mealType] = [];
      if (!updatedMealPlan[day][mealType].includes(recipeId)) {
        updatedMealPlan[day][mealType].push(recipeId);
      }
      return updatedMealPlan;
    });
    setShowMealPlanModal(false);
  };

  const removeFromMealPlan = (day, mealType, recipeId) => {
    setMealPlan(prev => {
      const updatedMealPlan = { ...prev };
      
      if (!updatedMealPlan[day] || !updatedMealPlan[day][mealType]) return updatedMealPlan;
      
      updatedMealPlan[day][mealType] = updatedMealPlan[day][mealType].filter(id => id !== recipeId);
      
      // Clean up empty arrays and objects
      if (updatedMealPlan[day][mealType].length === 0) {
        delete updatedMealPlan[day][mealType];
      }
      
      if (Object.keys(updatedMealPlan[day]).length === 0) {
        delete updatedMealPlan[day];
      }
      
      return updatedMealPlan;
    });
  };

  const markAsCooked = (recipeId) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked as cooked today
    if (!cookedRecipes.some(entry => entry.recipeId === recipeId && entry.date === today)) {
      setCookedRecipes(prev => [
        ...prev, 
        { 
          recipeId, 
          date: today, 
          timestamp: new Date().toISOString() 
        }
      ]);
    }
  };

  const addToShoppingList = (ingredients) => {
    const newItems = ingredients.map(ing => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: `${ing.amount} ${ing.unit} ${ing.name}`,
      checked: false,
      dateAdded: new Date().toISOString(),
    }));
    
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (itemId) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeShoppingItem = (itemId) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  // Form handlers
  const handleAddIngredient = () => {
    setNewRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { amount: '', unit: '', name: '' }],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setNewRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setNewRecipeForm(prev => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  const handleAddInstruction = () => {
    setNewRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  const handleInstructionChange = (index, value) => {
    setNewRecipeForm(prev => {
      const updatedInstructions = [...prev.instructions];
      updatedInstructions[index] = value;
      return { ...prev, instructions: updatedInstructions };
    });
  };

  const handleRemoveInstruction = (index) => {
    setNewRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result);
        setNewRecipeForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRecipe = () => {
    const newRecipe = {
      id: Date.now(),
      ...newRecipeForm,
      calories: parseInt(newRecipeForm.calories) || 0,
      protein: parseInt(newRecipeForm.protein) || 0,
      carbs: parseInt(newRecipeForm.carbs) || 0,
      fat: parseInt(newRecipeForm.fat) || 0,
      dateAdded: new Date().toISOString().split('T')[0],
      rating: 0,
      reviews: [],
    };
    
    setRecipes(prev => [...prev, newRecipe]);
    
    // Reset form
    setNewRecipeForm({
      title: '',
      description: '',
      ingredients: [{ amount: '', unit: '', name: '' }],
      instructions: [''],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      category: 'main',
      dietType: ['balanced'],
      difficulty: 'medium',
      image: null,
    });
    setUploadedImageUrl(null);
    setShowAddRecipeModal(false);
  };

  // Utility functions
  const generateWeeklyMealPlan = () => {
    const newMealPlan = {};
    const availableRecipes = [...recipes];
    
    weekDays.forEach(day => {
      newMealPlan[day.id] = {};
      
      mealTypes.forEach(meal => {
        if (availableRecipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableRecipes.length);
          newMealPlan[day.id][meal.id] = [availableRecipes[randomIndex].id];
          availableRecipes.splice(randomIndex, 1);
        }
      });
    });
    
    setMealPlan(newMealPlan);
  };

  const scaleRecipe = (recipe, newServings) => {
    if (!recipe || newServings < 1) return recipe;
    
    const scalingFactor = newServings / recipe.servings;
    
    return {
      ...recipe,
      servings: newServings,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        amount: (parseFloat(ing.amount) * scalingFactor).toFixed(2),
      })),
      calories: Math.round(recipe.calories * scalingFactor),
      protein: Math.round(recipe.protein * scalingFactor),
      carbs: Math.round(recipe.carbs * scalingFactor),
      fat: Math.round(recipe.fat * scalingFactor),
    };
  };

  const calculateCalories = () => {
    const { gender, age, weight, height, activity, goal } = calculatorForm;
    
    if (!age || !weight || !height) {
      alert('Please fill in all fields.');
      return;
    }
    
    // Calculate BMR using Mifflin-St Jeor equation
    const numericAge = parseInt(age);
    const numericWeight = parseFloat(weight);
    const numericHeight = parseFloat(height);
    
    let bmr;
    if (gender === 'male') {
      bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
    } else {
      bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161;
    }
    
    // Apply activity factor
    const activityFactors = {
      sedentary: 1.2,      // Little or no exercise
      light: 1.375,         // Light exercise 1-3 days/week
      moderate: 1.55,       // Moderate exercise 3-5 days/week
      active: 1.725,        // Active exercise 6-7 days/week
      veryActive: 1.9,      // Very active exercise or physical job
    };
    
    const maintenance = bmr * activityFactors[activity];
    
    // Adjust for goal
    const goalAdjustments = {
      lose: -500,    // Caloric deficit for weight loss
      maintain: 0,   // Maintain current weight
      gain: 500,     // Caloric surplus for weight gain
    };
    
    const recommended = maintenance + goalAdjustments[goal];
    
    setCalculatorResults({
      bmr: Math.round(bmr),
      maintenance: Math.round(maintenance),
      recommended: Math.round(recommended),
    });
    
    setShowNutritionModal(true);
  };

  const getCookingStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    const sortedCooked = [...cookedRecipes].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedCooked.length; i++) {
      const cookedDate = new Date(sortedCooked[i].date);
      const diffDays = Math.floor((currentDate - cookedDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  // Render the component based on the active view
  return (
    <div className={`healthy-recipes ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header Section */}
      <header className="app-header">
        <h1>Healthy Recipes</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <button 
            className="filter-button"
            onClick={() => setShowFilterModal(true)}
          >
            Filter
          </button>
          <button 
            className="add-recipe-button"
            onClick={() => setShowAddRecipeModal(true)}
          >
            Add Recipe
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="view-tabs">
          <button
            className={activeView === 'browse' ? 'active' : ''}
            onClick={() => setActiveView('browse')}
          >
            Browse
          </button>
          <button
            className={activeView === 'favorites' ? 'active' : ''}
            onClick={() => {
              setActiveView('favorites');
              setShowFavoritesModal(true);
            }}
          >
            Favorites
          </button>
          <button
            className={activeView === 'mealPlan' ? 'active' : ''}
            onClick={() => setActiveView('mealPlan')}
          >
            Meal Plan
          </button>
          <button
            className={activeView === 'shoppingList' ? 'active' : ''}
            onClick={() => {
              setActiveView('shoppingList');
              setShowShoppingListModal(true);
            }}
          >
            Shopping List
          </button>
          <button
            className={activeView === 'nutrition' ? 'active' : ''}
            onClick={() => setActiveView('nutrition')}
          >
            Nutrition Info
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        {/* Browse View */}
        {activeView === 'browse' && (
          <div className="browse-view">
            {/* Search and Filter Controls */}
            <div className="filters-container">
              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sort-options">
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="topRated">Top Rated</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="preparationTime">Prep Time</option>
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                </select>
              </div>
            </div>
            
            {/* Seasonal Collections */}
            <div className="seasonal-collections">
              <h2>Seasonal Collections</h2>
              <div className="collections-grid">
                {seasonalCollections.map((collection) => (
                  <div key={collection.id} className="collection-card">
                    <img src={collection.image} alt={collection.title} />
                    <h3>{collection.title}</h3>
                    <p>{collection.description}</p>
                    <button
                      onClick={() => {
                        setFilteredRecipes(
                          recipes.filter((recipe) => collection.recipes.includes(recipe.id))
                        );
                      }}
                    >
                      View Recipes
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recipe Grid */}
            <div className="recipes-grid">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-card">
                    <img src={recipe.image} alt={recipe.title} />
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description}</p>
                    <div className="recipe-meta">
                      <span>🕒 {recipe.prepTime + recipe.cookTime} min</span>
                      <span>🍽️ {recipe.servings} servings</span>
                      <span>🔥 {recipe.calories} kcal</span>
                    </div>
                    <div className="recipe-actions">
                      <button onClick={() => setSelectedRecipe(recipe)}>View</button>
                      <button 
                        className="favorite-button"
                        onClick={() => toggleFavorite(recipe.id)}
                      >
                        {favorites.includes(recipe.id) ? '❤️' : '🤍'}
                      </button>
                      <button 
                        className="shopping-list-button"
                        onClick={() => addToShoppingList(recipe.ingredients)}
                      >
                        Add to Shopping List
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No recipes found matching your criteria. Try changing your filters or search term.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meal Plan View */}
        {activeView === 'mealPlan' && (
          <div className="meal-plan-view">
            <div className="meal-plan-controls">
              <h2>Weekly Meal Plan</h2>
              <button onClick={generateWeeklyMealPlan}>Generate New Plan</button>
            </div>
            
            <div className="meal-plan-grid">
              {weekDays.map((day) => (
                <div key={day.id} className="day-plan">
                  <h3>{day.label}</h3>
                  {mealTypes.map((meal) => (
                    <div key={meal.id} className="meal-slot">
                      <h4>{meal.icon} {meal.label}</h4>
                      {mealPlan[day.id]?.[meal.id]?.map((recipeId) => {
                        const recipe = recipes.find((r) => r.id === recipeId);
                        return recipe ? (
                          <div key={recipe.id} className="meal-plan-recipe">
                            <span>{recipe.title}</span>
                            <div className="meal-plan-actions">
                              <button
                                className="view-recipe-button"
                                onClick={() => setSelectedRecipe(recipe)}
                              >
                                View
                              </button>
                              <button
                                className="remove-recipe-button"
                                onClick={() => removeFromMealPlan(day.id, meal.id, recipe.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                      <button
                        className="add-meal-button"
                        onClick={() => {
                          setSelectedDate(day.id);
                          setNewRecipeForm(prev => ({...prev, category: meal.id}));
                          setShowMealPlanModal(true);
                        }}
                      >
                        Add Recipe
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition View */}
        {activeView === 'nutrition' && (
          <div className="nutrition-view">
            <div className="nutrition-calculator">
              <h2>Nutrition Calculator</h2>
              <div className="calculator-form">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={calculatorForm.gender}
                    onChange={(e) =>
                      setCalculatorForm({ ...calculatorForm, gender: e.target.value })
                    }
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={calculatorForm.age}
                    onChange={(e) => setCalculatorForm({ ...calculatorForm, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={calculatorForm.weight}
                    onChange={(e) =>
                      setCalculatorForm({ ...calculatorForm, weight: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={calculatorForm.height}
                    onChange={(e) =>
                      setCalculatorForm({ ...calculatorForm, height: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select
                    value={calculatorForm.activity}
                    onChange={(e) =>
                      setCalculatorForm({ ...calculatorForm, activity: e.target.value })
                    }
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="veryActive">Very Active (physical job or 2x training)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Goal</label>
                  <select
                    value={calculatorForm.goal}
                    onChange={(e) =>
                      setCalculatorForm({ ...calculatorForm, goal: e.target.value })
                    }
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
                <button onClick={calculateCalories}>Calculate</button>
              </div>
            </div>
            
            <div className="nutrition-info-section">
              <h2>Nutrition Tips</h2>
              <div className="nutrition-tips">
                {nutritionInfo.map((info) => (
                  <div key={info.id} className="nutrition-card">
                    <div className="nutrition-card-header">
                      <span className="info-icon">{info.icon}</span>
                      <h3>{info.title}</h3>
                    </div>
                    <p>{info.content}</p>
                    {info.expanded && <p className="expanded-content">{info.expandedContent}</p>}
                    <button
                      className="toggle-info-button"
                      onClick={() => {
                        setNutritionInfo(
                          nutritionInfo.map((i) =>
                            i.id === info.id ? { ...i, expanded: !i.expanded } : i
                          )
                        );
                      }}
                    >
                      {info.expanded ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="modal">
          <div className="modal-content favorites-modal">
            <h2>Favorite Recipes</h2>
            <div className="recipes-grid">
              {recipes
                .filter((recipe) => favorites.includes(recipe.id))
                .map((recipe) => (
                  <div key={recipe.id} className="favorite-recipe-card">
                    <img src={recipe.image} alt={recipe.title} />
                    <h3>{recipe.title}</h3>
                    <div className="favorite-actions">
                      <button onClick={() => setSelectedRecipe(recipe)}>View</button>
                      <button onClick={() => toggleFavorite(recipe.id)}>Remove</button>
                      <button onClick={() => addToShoppingList(recipe.ingredients)}>
                        Add to Shopping List
                      </button>
                    </div>
                  </div>
                ))}
              {favorites.length === 0 && (
                <div className="no-favorites">
                  <p>You haven't added any favorites yet. Browse recipes and click the heart icon to add favorites.</p>
                </div>
              )}
            </div>
            <button className="close-modal-button" onClick={() => setShowFavoritesModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingListModal && (
        <div className="modal">
          <div className="modal-content shopping-list-modal">
            <h2>Shopping List</h2>
            {shoppingList.length > 0 ? (
              <ul className="shopping-list">
                {shoppingList.map((item) => (
                  <li key={item.id} className={item.checked ? 'checked' : ''}>
                    <div className="shopping-item-content">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleShoppingItem(item.id)}
                      />
                      <span className="item-name">{item.name}</span>
                    </div>
                    <button 
                      className="remove-item-button"
                      onClick={() => removeShoppingItem(item.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-list">
                <p>Your shopping list is empty. Add ingredients from recipes to get started.</p>
              </div>
            )}
            <div className="shopping-list-actions">
              <button onClick={() => setShoppingList([])}>Clear All</button>
              <button className="close-modal-button" onClick={() => setShowShoppingListModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal">
          <div className="modal-content filter-modal">
            <h2>Filter Recipes</h2>
            <div className="filter-options">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Diet Type</label>
                <select
                  value={selectedDietType}
                  onChange={(e) => setSelectedDietType(e.target.value)}
                >
                  <option value="all">All Diets</option>
                  {dietTypes.map((diet) => (
                    <option key={diet.id} value={diet.id}>
                      {diet.icon} {diet.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  {difficultyLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.icon} {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort By</label>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="topRated">Top Rated</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="preparationTime">Shortest Prep Time</option>
                  <option value="calories">Lowest Calories</option>
                  <option value="protein">Highest Protein</option>
                </select>
              </div>
            </div>
            <div className="filter-actions">
              <button onClick={() => {
                setSelectedCategory('all');
                setSelectedDietType('all');
                setSelectedDifficulty('all');
                setSortOption('newest');
              }}>
                Reset Filters
              </button>
              <button onClick={() => setShowFilterModal(false)}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Modal */}
      {showMealPlanModal && (
        <div className="modal">
          <div className="modal-content meal-plan-modal">
            <h2>Add to Meal Plan</h2>
            <div className="meal-plan-form">
              <div className="form-group">
                <label>Day</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {weekDays.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Meal</label>
                <select
                  value={newRecipeForm.category}
                  onChange={(e) =>
                    setNewRecipeForm({ ...newRecipeForm, category: e.target.value })
                  }
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.icon} {meal.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="recipe-selection">
              <h3>Select a Recipe</h3>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="meal-plan-search"
              />
              <div className="meal-plan-recipes-grid">
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="meal-plan-recipe-card">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.calories} calories | {recipe.prepTime + recipe.cookTime} min</p>
                    <button
                      onClick={() => addToMealPlan(recipe.id, selectedDate, newRecipeForm.category)}
                    >
                      Add to Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button className="close-modal-button" onClick={() => setShowMealPlanModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipeModal && (
        <div className="modal">
          <div className="modal-content add-recipe-modal">
            <h2>Add New Recipe</h2>
            <div className="recipe-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Recipe title"
                  value={newRecipeForm.title}
                  onChange={(e) => setNewRecipeForm({ ...newRecipeForm, title: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Brief description of the recipe"
                  value={newRecipeForm.description}
                  onChange={(e) =>
                    setNewRecipeForm({ ...newRecipeForm, description: e.target.value })
                  }
                />
              </div>
              
              <div className="form-group ingredients-section">
                <label>Ingredients</label>
                {newRecipeForm.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-input">
                    <input
                      type="text"
                      placeholder="Amount (e.g., 1)"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g., cup)"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Name (e.g., flour)"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    />
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button className="add-button" onClick={handleAddIngredient}>Add Ingredient</button>
              </div>
              
              <div className="form-group instructions-section">
                <label>Instructions</label>
                {newRecipeForm.instructions.map((instruction, index) => (
                  <div key={index} className="instruction-input">
                    <textarea
                      placeholder={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                    />
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveInstruction(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button className="add-button" onClick={handleAddInstruction}>Add Step</button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prep Time (min)</label>
                  <input
                    type="number"
                    value={newRecipeForm.prepTime}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, prepTime: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Cook Time (min)</label>
                  <input
                    type="number"
                    value={newRecipeForm.cookTime}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, cookTime: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Servings</label>
                  <input
                    type="number"
                    value={newRecipeForm.servings}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, servings: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Calories</label>
                  <input
                    type="number"
                    value={newRecipeForm.calories}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, calories: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Protein (g)</label>
                  <input
                    type="number"
                    value={newRecipeForm.protein}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, protein: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Carbs (g)</label>
                  <input
                    type="number"
                    value={newRecipeForm.carbs}
                    onChange={(e) => setNewRecipeForm({ ...newRecipeForm, carbs: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Fat (g)</label>
                  <input
                    type="number"
                    value={newRecipeForm.fat}
                    onChange={(e) => setNewRecipeForm({ ...newRecipeForm, fat: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newRecipeForm.category}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={newRecipeForm.difficulty}
                    onChange={(e) =>
                      setNewRecipeForm({ ...newRecipeForm, difficulty: e.target.value })
                    }
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group diet-type-section">
                <label>Diet Types</label>
                <div className="diet-type-checkboxes">
                  {dietTypes.map((diet) => (
                    <label key={diet.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newRecipeForm.dietType.includes(diet.id)}
                        onChange={() => {
                          const updatedDietTypes = newRecipeForm.dietType.includes(diet.id)
                            ? newRecipeForm.dietType.filter((d) => d !== diet.id)
                            : [...newRecipeForm.dietType, diet.id];
                          setNewRecipeForm({ ...newRecipeForm, dietType: updatedDietTypes });
                        }}
                      />
                      {diet.icon} {diet.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group image-upload-section">
                <label>Recipe Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {uploadedImageUrl && (
                  <div className="image-preview-container">
                    <img src={uploadedImageUrl} alt="Recipe preview" className="image-preview" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleAddRecipe} disabled={!newRecipeForm.title}>Save Recipe</button>
              <button onClick={() => setShowAddRecipeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Results Modal */}
      {showNutritionModal && (
        <div className="modal">
          <div className="modal-content nutrition-results-modal">
            <h2>Your Calorie Needs</h2>
            <div className="results-content">
              <div className="result-item">
                <h3>Basal Metabolic Rate (BMR)</h3>
                <p className="result-value">{calculatorResults.bmr} calories/day</p>
                <p className="result-description">This is the number of calories your body needs to maintain basic functions at rest.</p>
              </div>
              
              <div className="result-item">
                <h3>Maintenance Calories</h3>
                <p className="result-value">{calculatorResults.maintenance} calories/day</p>
                <p className="result-description">This is the number of calories needed to maintain your current weight with your activity level.</p>
              </div>
              
              <div className="result-item highlight">
                <h3>Recommended Daily Intake</h3>
                <p className="result-value">{calculatorResults.recommended} calories/day</p>
                <p className="result-description">This is your recommended daily calorie intake based on your goal to {calculatorForm.goal === 'lose' ? 'lose' : calculatorForm.goal === 'gain' ? 'gain' : 'maintain'} weight.</p>
              </div>
            </div>
            <button className="close-modal-button" onClick={() =>
            setShowNutritionModal(false)}>Close</button>
            </div>
          </div>
        )}
  
        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div className="modal">
            <div className="modal-content recipe-details-modal">
              <div className="recipe-header">
                <h2>{selectedRecipe.title}</h2>
                <div className="recipe-actions-top">
                  <button 
                    className="favorite-button"
                    onClick={() => toggleFavorite(selectedRecipe.id)}
                  >
                    {favorites.includes(selectedRecipe.id) ? '❤️' : '🤍'}
                  </button>
                  <button onClick={() => setSelectedRecipe(null)}>Close</button>
                </div>
              </div>
              
              <div className="recipe-details-content">
                <div className="recipe-image-container">
                  <img src={selectedRecipe.image} alt={selectedRecipe.title} />
                  <div className="recipe-badges">
                    {selectedRecipe.dietType.map(diet => {
                      const dietInfo = dietTypes.find(d => d.id === diet);
                      return dietInfo ? (
                        <span key={diet} className="diet-badge">
                          {dietInfo.icon} {dietInfo.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="recipe-description">
                  <p>{selectedRecipe.description}</p>
                </div>
                
                <div className="recipe-meta-details">
                  <div className="meta-item">
                    <span className="meta-icon">🕒</span>
                    <span className="meta-label">Prep Time</span>
                    <span className="meta-value">{selectedRecipe.prepTime} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👨‍🍳</span>
                    <span className="meta-label">Cook Time</span>
                    <span className="meta-value">{selectedRecipe.cookTime} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🍽️</span>
                    <span className="meta-label">Servings</span>
                    <span className="meta-value">{selectedRecipe.servings}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🔥</span>
                    <span className="meta-label">Calories</span>
                    <span className="meta-value">{selectedRecipe.calories}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">💪</span>
                    <span className="meta-label">Protein</span>
                    <span className="meta-value">{selectedRecipe.protein}g</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🥖</span>
                    <span className="meta-label">Carbs</span>
                    <span className="meta-value">{selectedRecipe.carbs}g</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">🧈</span>
                    <span className="meta-label">Fat</span>
                    <span className="meta-value">{selectedRecipe.fat}g</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">
                      {difficultyLevels.find(d => d.id === selectedRecipe.difficulty)?.icon || '😊'}
                    </span>
                    <span className="meta-label">Difficulty</span>
                    <span className="meta-value">
                      {difficultyLevels.find(d => d.id === selectedRecipe.difficulty)?.label || 'Medium'}
                    </span>
                  </div>
                </div>
                
                <div className="recipe-sections">
                  <div className="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul className="ingredients-list">
                      {selectedRecipe.ingredients.map((ing, index) => (
                        <li key={index}>
                          <span className="ingredient-amount">{ing.amount} {ing.unit}</span> 
                          <span className="ingredient-name">{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="instructions-section">
                    <h3>Instructions</h3>
                    <ol className="instructions-list">
                      {selectedRecipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                
                <div className="recipe-actions-bottom">
                  <div className="servings-control">
                    <button 
                      onClick={() => selectedRecipe.servings > 1 && setSelectedRecipe(scaleRecipe(selectedRecipe, selectedRecipe.servings - 1))}
                      disabled={selectedRecipe.servings <= 1}
                    >
                      −
                    </button>
                    <span>{selectedRecipe.servings} servings</span>
                    <button onClick={() => setSelectedRecipe(scaleRecipe(selectedRecipe, selectedRecipe.servings + 1))}>
                      +
                    </button>
                  </div>
                  
                  <div className="action-buttons">
                    <button onClick={() => addToShoppingList(selectedRecipe.ingredients)}>
                      Add to Shopping List
                    </button>
                    <button onClick={() => {
                      markAsCooked(selectedRecipe.id);
                      alert('Recipe marked as cooked!');
                    }}>
                      Mark as Cooked
                    </button>
                    <button onClick={() => {
                      setSelectedDate('monday'); // Default to Monday
                      setNewRecipeForm(prev => ({...prev, category: 'dinner'}));
                      setShowMealPlanModal(true);
                    }}>
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
                
                <div className="recipe-tips">
                  <h3>Cooking Tips</h3>
                  <div className="cooking-tips-grid">
                    {cookingTips.map((tip) => (
                      <div key={tip.id} className="tip-card">
                        <div className="tip-icon">{tip.icon}</div>
                        <h4>{tip.title}</h4>
                        <p>{tip.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default HealthyRecipes;
