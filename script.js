let $links;

$(function() {
  displayStories();

  $('#submitText').on('click', function() {
    $('#submitForm').slideToggle();
  });
  $('#signUpText').on('click', function() {
    $('#signupForm').slideToggle();
  });
  $('#loginText').on('click', function() {
    $('#loginForm').slideToggle();
  });

  $('#favoritesText').on('click', displayFavorites);
  $('#profileText').on('click', showUserProfile);

  $links = $('.link-row');

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

  $('ol').on('click', '.star', toggleFavoriteIcon);
  $('ol').on('click', '.link', function(event) {
    showHostnameLinks($(event.target).text());
  });
});

function displayStories() {
  //query API to get a list of all stories
  $.getJSON(`https://hack-or-snooze.herokuapp.com/stories`)
    .then(stories => {
      //construct a link and append it to the page
      stories.data.forEach(story => {
        constructAndDisplayStoryLink(story);
      });
    })
    .catch(err => console.log(err));
}
function displayFavorites() {
  //query API to get a list of all stories
  let userName = localStorage.getItem('userName');
  let token = localStorage.getItem('token');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}`,

    headers: { Authorization: 'Bearer ' + token }
  }).then(response => {
    $('#links').empty();
    response.data.favorites.forEach(val => constructAndDisplayStoryLink(val));
  });
}

function constructAndDisplayStoryLink(story) {
  let $newLink = $(
    `<li class="link-row" id="${story.storyId}">
    <i class="star far fa-star">
    </i><a href="${story.url}">"${story.title}"</a>
    <span class="link">("${story.url}")</span>
    </li>`
  );
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
      let token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', username);
    }
  );
}

function showUserProfile() {
  $('#link-container').empty();
  let token = localStorage.getItem('token');
  let userName = localStorage.getItem('userName');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(response => {
    let name = response.data.name;
    let userName = response.data.username;
    // let profileName = $('<p>', { text: `Name:      ${name}` });
    // let profileUsername = $('<p>', { text: `User Name:      ${userName}` });
    // $('#profile-container').append(profileName, profileUsername);

    $('#profileName').text(`Name:      ${name}`);
    $('#profileUserName').text(`User Name:      ${userName}`);
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

function toggleFavoriteIcon(event) {
  console.log(event.target);
  let storyId = $(event.target)
    .parent()
    .attr('id');

  let token = localStorage.getItem('token');
  let userName = localStorage.getItem('userName');
  $.ajax({
    method: 'POST',
    url: `https://hack-or-snooze.herokuapp.com/users/${userName}/favorites/${storyId}`,

    headers: { Authorization: 'Bearer ' + token }
  }).then(resp => console.log(resp));

  // $(event.target).toggleClass('far fas');
  // $(event.target)
  //   .parent()
  //   .toggleClass('favorite');
}

function toggleFavorites() {
  if ($('#links').hasClass('all')) {
    let $favorites = $('.link-row').filter('.favorite');
    $('#links').empty();
    $('#links').append($favorites);
    $('#favoritesText').text('all');
  } else {
    $('#links').empty();
    displayStories();
    // $('#links').append($links);
    $('#favoritesText').text('favorites');
  }
  $('#links').toggleClass('all favorites');
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
