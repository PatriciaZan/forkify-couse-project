import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if(module.hot){
//   module.hot.accept();
// }

// Link to the course API - Link da API utilizada no curso
// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

// API call - Chamada da API
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result - Atualizar a vizualização dos resultados para marcar a busca selecionada
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe... - Carregando receita...
    await model.loadRecipe(id);

    // Rendering recipe - Renderiza receita
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Get search query - Mostra a lista do resultado da busca
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResults(query);

    // Render results
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // Render initial pagination buttons - Carrega os botões da página
    paginationView.render(model.state.search);
  } catch (err) {
    //console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render New results and New pagination buttons - Renderiza novos resultados e boões
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state) - Atualiza as porções
  model.updateServings(newServings);

  // Update the recipe view - Atualiza a visualizaçãoa das receitas
  //recipeView.render(model.state.recipe); 
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/remove bookmark - Adiciona/Remove favoritos
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //model.addBookmark(model.state.recipe);
  // Update recipe view - Atualiza a visualização das receitas
  recipeView.update(model.state.recipe);

  // Render bookmarks - Renderiza os favoritos
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner - Mostra o icone de carregamento
    addRecipeView.renderSpinner();

    // Upload the new recipe data - Adicionar uma nova Receita
    await model.uploadRecipe(newRecipe);
    //console.log(model.state.recipe);

    // Render recipe - Renderizar receitas
    recipeView.render(model.state.recipe);

    // Display Success message - Mostrar mensagem de sucesso
    addRecipeView.renderMessage();

    // Render bookmark view - Renderizar favorito
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL - mudar o ID na URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //window.history.back();

    // Close form window - Fechar a janela da 'form' de adicionar receita
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
