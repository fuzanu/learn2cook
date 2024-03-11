const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");
const resetPageBtn = document.getElementById("reset-page");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addMealFav(meal);
  }
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
        <div class="meal-header">
            ${
              random
                ? `
              <button class="random-btn">Random Recipe</button>`
                : ""
            }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>  
            <button class="fav-btn"><i class="fa-solid fa-heart"></i></button>
            <button class="info-btn"><i class="fa-solid fa-circle-info"></i></button>
        </div>
    `;
  const randomBtn = meal.querySelector(".meal-header .random-btn");
  const favBtn = meal.querySelector(".meal-body .fav-btn");
  const infoBtn = meal.querySelector(".meal-body .info-btn");

  if (random) {
    randomBtn.addEventListener("click", () => {
      getRandomMeal();

      location.reload();
    });
  }

  favBtn.addEventListener("click", () => {
    if (favBtn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      favBtn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      favBtn.classList.add("active");
    }

    fetchFavMeals();
  });

  infoBtn.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
      <div class="info">    
          <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <span >${mealData.strMeal}</span>
      </div>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

  const removeBtn = favMeal.querySelector(".clear");
  const infoBtn = favMeal.querySelector(".info");

  removeBtn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);
    fetchFavMeals();
  });

  infoBtn.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";

  // update the Meal info
  const mealEl = document.createElement("div");

  const ingredients = [];

  // get ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
      <h1>${mealData.strMeal}</h1>
      <img
          src="${mealData.strMealThumb}"
          alt="${mealData.strMeal}"
      />
      <p>
      ${mealData.strInstructions}
      </p>
      <h3>Ingredients:</h3>
      <ul>
          ${ingredients
            .map(
              (ing) => `
          <li>${ing}</li>
          `
            )
            .join("")}
      </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  // clean container
  mealsEl.innerHTML = "";

  const search = searchTerm.value;
  const meals = await getMealsBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

resetPageBtn.addEventListener("click", () => {
  location.reload();
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
