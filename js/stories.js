"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <button class="btn ${story.favorite ? 'selectedFavorite' : null}" id="${story.storyId}"><i class="fa fa-star"></i></button>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <button class="${currentUser.username === story.username ? 'owned' : 'hidden'}" id="delete-story" data-id="${story.storyId}">x</button>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  
  // loop through all of our stories and generate HTML for them
  if(currentUser){
    const favorites = currentUser.favorites;
    addClassToFavorites(favorites);
  }
  
  storyList.stories.forEach((story, i) => {
    const $story = generateStoryMarkup(story, i);
    $allStoriesList.append($story);
  })

  $allStoriesList.show();
}

//Get new stories 
async function getNewStoryOnPage() {

  const title = $('#story-title').val();
  const author = $('#story-author').val();
  const url = $('#story-url').val(); 

  // console.log(title, author, url);
  const story =  await storyList.addStory(currentUser, {title, author, url});
  await getAndShowStoriesOnStart();
}

$newStoryForm.on('submit', function(e){
  e.preventDefault();
  getNewStoryOnPage();
  $(this).hide();
})

//Remove Stories
$allStoriesList.on('click', '#delete-story', async function(){
  const storyId = $(this).data().id;
  const token = currentUser.loginToken;
  const res = await axios({
    url: `${BASE_URL}/stories/${storyId}`,  
    method: "DELETE",
    data: {token: `${currentUser.loginToken}`}}
  );
  console.log(res, "deleted story"); 
  $(this).parent().remove();
})


// Loop through favorites 
function addClassToFavorites(fav){
  if(fav){
    fav.split(',').forEach((el) => {
      storyList.stories.forEach((story) => {
        if(el === story.storyId){
          story.favorite = true; 
        }
      })
    })
  }
}