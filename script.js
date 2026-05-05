var recipes = JSON.parse(localStorage.getItem("recipes")) || [];
var editIndex = -1;
var pendingImageData = "";

displayRecipes();

document.getElementById("imageFile").addEventListener("change", function () {
  var file = this.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (e) {
    pendingImageData = e.target.result;
    var preview = document.getElementById("preview");
    preview.src = pendingImageData;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("filter").addEventListener("change", applyFilters);

function applyFilters() {
  var query    = document.getElementById("search").value.toLowerCase().trim();
  var category = document.getElementById("filter").value;

  var filtered = [];
  for (var i = 0; i < recipes.length; i++) {
    var r = recipes[i];
    var matchSearch   = r.title.toLowerCase().indexOf(query) !== -1 ||
                        r.ingredients.toLowerCase().indexOf(query) !== -1;
    var matchCategory = category === "All" || r.category === category;
    if (matchSearch && matchCategory) {
      filtered.push(r);
    }
  }

  displayRecipes(filtered);
}

function handleSubmit() {
  var titleVal       = document.getElementById("title").value.trim();
  var ingredientsVal = document.getElementById("ingredients").value.trim();
  var stepsVal       = document.getElementById("steps").value.trim();
  var categoryVal    = document.getElementById("category").value;
  var msgEl          = document.getElementById("message");

  if (!titleVal || !ingredientsVal || !stepsVal || !categoryVal) {
    msgEl.textContent = "Please fill in all fields and select a category.";
    msgEl.style.color = "red";
    return;
  }

  var imageToSave = "";
  if (pendingImageData !== "") {
    imageToSave = pendingImageData;
  } else if (editIndex >= 0) {
    imageToSave = recipes[editIndex].image;
  }

  var recipe = {
    title:       titleVal,
    ingredients: ingredientsVal,
    steps:       stepsVal,
    category:    categoryVal,
    image:       imageToSave
  };

  if (editIndex >= 0) {
    recipes[editIndex] = recipe;
    editIndex = -1;
    document.getElementById("formHeading").textContent = "Add New Recipe";
    document.getElementById("submitBtn").textContent   = "Add Recipe";
    document.getElementById("cancelBtn").style.display = "none";
    msgEl.textContent = titleVal + " updated successfully!";
  } else {
    recipes.push(recipe);
    msgEl.textContent = titleVal + " added successfully!";
  }

  msgEl.style.color = "green";
  setTimeout(function () { msgEl.textContent = ""; }, 3000);

  localStorage.setItem("recipes", JSON.stringify(recipes));

  clearFields();

  displayRecipes();
}

function editRecipe(index) {
  var r = recipes[index];

  document.getElementById("title").value       = r.title;
  document.getElementById("ingredients").value = r.ingredients;
  document.getElementById("steps").value       = r.steps;
  document.getElementById("category").value    = r.category;

  var preview = document.getElementById("preview");
  if (r.image && r.image !== "") {
    preview.src = r.image;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }

  pendingImageData = "";

  editIndex = index;
  document.getElementById("formHeading").textContent = "Edit Recipe";
  document.getElementById("submitBtn").textContent   = "Save Changes";
  document.getElementById("cancelBtn").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editIndex = -1;
  clearFields();
  document.getElementById("formHeading").textContent = "Add New Recipe";
  document.getElementById("submitBtn").textContent   = "Add Recipe";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("message").textContent     = "";
}

function deleteRecipe(index) {
  var name = recipes[index].title;
  if (!confirm("Delete \"" + name + "\"?")) return;

  if (editIndex === index) {
    cancelEdit();
  } else if (editIndex > index) {
    editIndex--;
  }

  recipes.splice(index, 1);
  localStorage.setItem("recipes", JSON.stringify(recipes));
  displayRecipes();
}

function displayRecipes(list) {
  if (list === undefined) {
    list = recipes;
  }

  var container = document.getElementById("recipeList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p style='color:#aaa;text-align:center;padding:40px 0;'>No recipes yet. Add your first one!</p>";
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var r         = list[i];
    var realIndex = recipes.indexOf(r);

    var imgHTML = "";
    if (r.image && r.image !== "") {
      imgHTML = "<img src='" + r.image + "' class='recipe-img' onerror=\"this.style.display='none'\">";
    } else {
      imgHTML = "<div class='no-img'>🍽️</div>";
    }

    var card = "<div class='recipe'>" +
      imgHTML +
      "<h3>" + r.title + "</h3>" +
      "<p><b>" + r.category + "</b></p>" +
      "<p>" + r.ingredients + "</p>" +
      "<p>" + r.steps + "</p>" +
      "<button onclick='editRecipe(" + realIndex + ")'>Edit</button>" +
      "<button class='delete-btn' onclick='deleteRecipe(" + realIndex + ")'>Delete</button>" +
      "</div>";

    container.innerHTML += card;
  }
}

function clearFields() {
  document.getElementById("title").value             = "";
  document.getElementById("ingredients").value       = "";
  document.getElementById("steps").value             = "";
  document.getElementById("category").value          = "";
  document.getElementById("imageFile").value         = "";
  document.getElementById("preview").style.display   = "none";
  document.getElementById("preview").src             = "";
  pendingImageData = "";
}