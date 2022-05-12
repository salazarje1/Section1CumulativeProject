"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  currentUser.favorites = localStorage.getItem('favorite');
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const favorite = localStorage.getItem("favorite");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username, favorite);
  currentUser.favorites = favorite;
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
    localStorage.setItem("favorite", currentUser.favorites); 
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  const favorite = localStorage.getItem('favorite'); 
  $allStoriesList.on('load', function(){
    console.log('load');
    favorite.array.forEach(element => {
      if($(this).attr('id') === element){
        $(this).addClass('selectedFavorite')
      }
    });
  })
  $allStoriesList.show();

  updateNavOnLogin();
}

/******************************************************************************
 * Add favorites section 
 */
// console.log(favoriteStories);

const localFavorties = localStorage.getItem('favorite');
let favoriteStories = []; 
if(localFavorties){
  favoriteStories = localFavorties.split(','); 
}

$allStoriesList.on('click', '.btn', function() {
  const btn = $(this);
  if(btn.hasClass('selectedFavorite')){
    removeFavorite(btn); 
  } else {
    getFavorites(btn);
  }
})

// Getting and setting favorites
function getFavorites(btn){
  if(favoriteStories){
    localStorage.removeItem('favorite');
    favoriteStories.push(btn.attr('id'));
  } else{
    favoriteStories = []; 
    favoriteStories.push(btn.attr('id'))
  }
  
  btn.addClass('selectedFavorite');
  localStorage.setItem('favorite', favoriteStories)
}

// Remove favorite 
function removeFavorite(btn){
  btn.removeClass('selectedFavorite');
  localStorage.removeItem('favorite');
  favoriteStories = favoriteStories.filter((el) => {
    if(el !== btn.attr('id')){
      return el;
    }
  })
  localStorage.setItem('favorite', favoriteStories);
}


// Button to see only favorites 
$navFavorite.on('click', async function(e){
  e.preventDefault();
  console.log('click'); 
  $allStoriesList.empty();
  console.log(storyList);
  const favList = storyList.stories.filter((el) => {
    if(el.favorite){
      return el; 
    }
  })
  storyList.stories = favList; 
  putStoriesOnPage();
})

// button to go back to home page
$navAll.on('click', function(e){
  console.log('clicked');
  start();
})
