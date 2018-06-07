let isLoggedIn = false;

$(function() {
  displayStories();

  $('#logo').on('click', displayStories);
  $('#submitText').on('click', function() {
    $('#submitForm').slideToggle();
  });
  $('#signUpText').on('click', function() {
    $('#signupForm').slideToggle();
  });
  $('#loginText').on('click', function() {
    $('#loginForm').slideToggle();
  });

  $('#favoritesText').on('click', displayUserFavorites);
  $('#storiesText').on('click', displayUserStories);
  $('#profileText').on('click', showUserProfile);

  $('.container').on('submit', '#submitForm', function(event) {
    event.preventDefault();
    createNewStory();
  });

  $('.form').on('submit', '#signupForm', function(event) {
    event.preventDefault();
    createNewUser();
  });

  $('.form').on('submit', '#loginForm', function(event) {
    event.preventDefault();
    loginUser();
  });

  $('ol').on('click', '.star', toggleFavorite);
  $('ol').on('click', '.deleteBtn', deleteStory);
  $('ol').on('click', '.link', function(event) {
    showHostnameLinks($(event.target).text());
  });

  checkIfLoggedIn();
});

function checkIfLoggedIn() {
  if (localStorage.getItem('token') && localStorage.getItem('userName')) {
    isLoggedIn = true;
  } else {
    isLoggedIn = false;
  }
}

function displayStories() {
  //query API to get a list of all stories
  $('#profile-container').empty();
  $('#links').empty();
  $.getJSON(`https://hack-or-snooze.herokuapp.com/stories`)
    .then(stories => {
      //construct a link and append it to the page
      stories.data.forEach(story => {
        constructAndDisplayStoryLink(story);
      });
      if (isLoggedIn) {
        getUserFavorites()
          .then(favorites => {
            let favoritesSet = new Set();
            favorites.forEach(favorite => {
              favoritesSet.add(favorite.storyId);
            });
            console.log(favoritesSet);
            $('#links i').each((index, elem) => {
              console.log(elem);
              if (
                favoritesSet.has(
                  $(elem)
                    .parent()
                    .attr('id')
                )
              ) {
                $(elem).toggleClass('far fas');
              }
            });
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
}

function getUserFavorites() {
  let userName = localStorage.getItem('userName');
  let token = localStorage.getItem('token');
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: `https://hack-or-snooze.herokuapp.com/users/${userName}`,
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(response => resolve(response.data.favorites))
      .catch(err => reject(err));
  });
}

function displayUserFavorites() {
  $('#profile-container').empty();
  getUserFavorites().then(favorites => {
    $('#links').empty();
    favorites.forEach(val => constructAndDisplayStoryLink(val, true));
  });
}

function displayUserStories() {
  $('#profile-container').empty();
  //query API to get a list of all stories
  let userName = localStorage.getItem('userName');
  let token = localStorage.getItem('token');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(response => {
    $('#links').empty();
    response.data.stories.forEach(val =>
      constructAndDisplayStoryLink(val, false, true)
    );
  });
}

function constructAndDisplayStoryLink(
  story,
  isFavorites = false,
  isOwnStory = false
) {
  let starClass = 'far';
  if (isFavorites) starClass = 'fas';
  let $newLink = $(
    `<li class="link-row" id="${story.storyId}">
    <i class="star ${starClass} fa-star">
    </i><a href="${story.url}">${story.title}</a>
    <span class="link">(${story.url})</span>
    </li>`
  );
  if (isOwnStory) {
    $newLink.append($('<button class="deleteBtn">DELETE</button>'));
  }
  $('#links').append($newLink);
}

function createNewUser() {
  let name = $('#name').val();
  let username = $('#usernameSignUp').val();
  let password = $('#passwordSignUp').val();
  let dataObj = {
    data: {
      name: name,
      username: username,
      password: password
    }
  };

  $.post('https://hack-or-snooze.herokuapp.com/users', dataObj).then(msg => {
    alert(`Sign Up Successful!`);
    console.log(msg);
  });
}

function loginUser() {
  let username = $('#usernameLogin').val();
  let password = $('#passwordLogin').val();

  let dataObj = {
    data: {
      username: username,
      password: password
    }
  };
  $.post('https://hack-or-snooze.herokuapp.com/auth', dataObj).then(
    response => {
      console.log(response);
      let token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', username);
    }
  );
}

function showUserProfile() {
  $('#links').empty();
  let token = localStorage.getItem('token');
  let userName = localStorage.getItem('userName');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(response => {
    let name = response.data.name;
    let userName = response.data.username;
    let profileName = $('<p>', { text: `Name:      ${name}` });
    let profileUsername = $('<p>', { text: `User Name:      ${userName}` });
    $('#profile-container').append(profileName, profileUsername);

    // $('#profileName').text(`Name:      ${name}`);
    // $('#profileUserName').text(`User Name:      ${userName}`);
  });
}

function createNewStory() {
  //pull data from form
  let title = $('#title').val();
  let url = $('#url').val();
  let author = $('#author').val();
  let dataObj = {
    data: {
      username: localStorage.getItem('userName'),
      title: title,
      url: url,
      author: author
    }
  };
  let token = localStorage.getItem('token');
  $.ajax({
    method: 'POST',
    url: 'https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10',
    data: dataObj,
    headers: { Authorization: 'Bearer ' + token }
  }).then(response => displayStories());

  //clear form
  $('#title').val('');
  $('#url').val('');
}

function deleteStory(event) {
  let storyID = $(event.target)
    .parent()
    .attr('id');
  let token = localStorage.getItem('token');

  $.ajax({
    method: 'DELETE',
    url: `https://hack-or-snooze.herokuapp.com/stories/${storyID}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(resp => {
    console.log(resp);
    displayUserStories();
  });
}

function toggleFavorite(event) {
  console.log(event.target);
  let storyId = $(event.target)
    .parent()
    .attr('id');
  let token = localStorage.getItem('token');
  let userName = localStorage.getItem('userName');
  let method = 'POST';

  //is a favorite
  if ($(event.target).hasClass('fas')) {
    //remove from favorites list
    method = 'DELETE';
  }

  $.ajax({
    method: method,
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}/favorites/${storyId}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(resp => console.log(resp));

  $(event.target).toggleClass('far fas');
}

function showHostnameLinks(urlText) {
  //strip leading and trailing parentheses
  let strippedURLText = urlText.substring(1, urlText.length - 1);
  let targetHostname = new URL(strippedURLText).hostname;

  let $hostnameLinks = $('.link-row').filter(function(i, el) {
    let linkURL = $(el)
      .children('.link')
      .text();
    let strippedLinkURL = linkURL.substring(1, linkURL.length - 1);
    let linkHostname = new URL(strippedLinkURL).hostname;
    return linkHostname === targetHostname;
  });

  $('#links').empty();
  $('#links').append($hostnameLinks);
  $('#favoritesText').text('all');
  $('#links').toggleClass('all favorites');
}
