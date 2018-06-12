$(function() {
  attachNavBarListeners();
  buildNavBar();
  displayStories();

  addFormListener('#submitForm', createNewStory);
  addFormListener('#signupForm', createNewUser);
  addFormListener('#loginForm', loginUser);

  $('ol').on('click', '.star', toggleFavorite);
  $('ol').on('click', '.deleteBtn', deleteStory);
  $('ol').on('click', '.link', function(event) {
    showHostnameLinks($(event.target).text());
  });
});

function isLoggedIn() {
  if (localStorage.getItem('token') && localStorage.getItem('username')) {
    return true;
  } else {
    return false;
  }
}

function addFormListener(id, fn) {
  $('.form').on('submit', id, function(event) {
    event.preventDefault();
    fn();
    clearForm($(event.target));
  });
}

function attachNavBarListeners() {
  $('#logo').on('click', function() {
    $('#submitForm').slideUp();
    $('#loginForm').slideUp();
    $('#signupForm').slideUp();
    displayStories();
  });
  $('#favoritesText').on('click', displayUserFavorites);
  $('#storiesText').on('click', displayUserStories);
  $('#profileText').on('click', showUserProfile);
  $('#logoutText').on('click', logoutUser);

  $('#submitText').on('click', function() {
    $('#loginForm').slideUp();
    $('#signupForm').slideUp();
    $('#submitForm').slideToggle();
  });
  $('#signUpText').on('click', function() {
    $('#submitForm').slideUp();
    $('#loginForm').slideUp();
    $('#signupForm').slideToggle();
  });
  $('#loginText').on('click', function() {
    $('#submitForm').slideUp();
    $('#signupForm').slideUp();
    $('#loginForm').slideToggle();
  });
}

function buildNavBar() {
  if (isLoggedIn()) {
    $('.auth-required').show();
    $('.auth-not-required').hide();
  } else {
    $('.auth-required').hide();
    $('.auth-not-required').show();
  }
}

function clearForm($form) {
  $form.find('input').val('');
  $form.parent().slideUp();
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
      if (isLoggedIn()) {
        checkListForUserFavorites();
      }
    })
    .catch(err => console.log(err));
}

// function checkListForUserFavorites() {
//   getUserFavorites()
//     .then(favorites => {
//       const favoritesSet = new Set();
//       favorites.forEach(favorite => {
//         favoritesSet.add(favorite.storyId);
//       });
//       console.log(favoritesSet);
//       $('#links i').each((index, elem) => {
//         if (
//           favoritesSet.has(
//             $(elem)
//               .parent()
//               .attr('id')
//           )
//         ) {
//           console.log('fired');
//           $(elem).toggleClass('far fas');
//         }
//       });
//     })
//     .catch(err => console.log(err));
// }

function checkListForUserFavorites(favorites) {
  const favoritesSet = new Set();
  favorites.forEach(favorite => {
    favoritesSet.add(favorite.storyId);
  });
  console.log(favoritesSet);
  $('#links i').each((index, elem) => {
    if (
      favoritesSet.has(
        $(elem)
          .parent()
          .attr('id')
      )
    ) {
      console.log('fired');
      $(elem).toggleClass('far fas');
    }
  });
}

function getUserFavorites() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'GET',
      url: `https://hack-or-snooze.herokuapp.com/users/${username}`,
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => resolve(res.data.favorites))
      .catch(err => reject(err));
  });
}

function displayUserFavorites() {
  $('#profile-container').empty();
  getUserFavorites().then(favorites => {
    $('#links').empty();
    favorites.forEach(story => constructAndDisplayStoryLink(story, true));
    checkListForUserFavorites(favorites);
  });
}

function displayUserStories() {
  $('#profile-container').empty();

  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${username}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    $('#links').empty();
    res.data.stories.forEach(story =>
      constructAndDisplayStoryLink(story, false, true)
    );
  });
}

function constructAndDisplayStoryLink(
  story,
  isFavorites = false,
  isOwnStories = false
) {
  let starClass = 'far';
  if (isFavorites) starClass = 'fas';

  const $newLink = $(
    `<li class="link-row" id="${story.storyId}">
    <i class="star ${starClass} fa-star">
    </i><a href="${story.url}">${story.title}</a>
    <span class="link">(${story.url})</span>
    <div class='link-details'><span>submitted by ${
      story.username
    } ${getTimeElapsed(story.createdAt)}</span></div>
    </li>`
  );

  if (isOwnStories) {
    $newLink.append($('<button class="deleteBtn">DELETE</button>'));
  }

  $('#links').append($newLink);
}

function getTimeElapsed(dateString) {
  let dateMilliseconds = Date.parse(dateString);
  let differenceInSeconds = (Date.now() - dateMilliseconds) / 1000;
  if (differenceInSeconds < 3600) {
    return `${Math.ceil(differenceInSeconds / 60)} minutes ago`;
  } else if (differenceInSeconds < 86400) {
    return `${Math.ceil(differenceInSeconds / 3600)} hours ago`;
  } else {
    return `${Math.ceil(differenceInSeconds / 86400)} days ago`;
  }
}

function createNewUser() {
  const dataObj = {
    data: {
      name: $('#name').val(),
      username: $('#usernameSignUp').val(),
      password: $('#passwordSignUp').val()
    }
  };

  $.post('https://hack-or-snooze.herokuapp.com/users', dataObj).then(res => {
    alert(`successfully signed up as ${res.username}`);
  });
}

function loginUser() {
  const username = $('#usernameLogin').val();
  const dataObj = {
    data: {
      username: username,
      password: $('#passwordLogin').val()
    }
  };
  $.post('https://hack-or-snooze.herokuapp.com/auth', dataObj).then(res => {
    const token = res.data.token;
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', username);
    buildNavBar();
    displayStories();
  });
}

function logoutUser() {
  localStorage.clear();
  buildNavBar();
  displayStories();
}

function showUserProfile() {
  $('#links').empty();
  $('#profile-container').empty();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  $.ajax({
    method: 'GET',
    url: `https://hack-or-snooze.herokuapp.com/users/${username}`,
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    const $name = $(`<h3>Name: ${res.data.name}</h3>`);
    const $username = $(`<h3>Username: ${res.data.username}</h3>`);
    const $joinedOn = $(`<h3>Member Since: ${res.data.createdAt}</h3>`);
    $('#profile-container').append($name, $username, $joinedOn);
  });
}

function createNewStory() {
  const title = $('#title').val();
  const url = $('#url').val();
  const author = $('#author').val();
  const dataObj = {
    data: {
      username: localStorage.getItem('username'),
      title: title,
      url: url,
      author: author
    }
  };
  const token = localStorage.getItem('token');
  $.ajax({
    method: 'POST',
    url: 'https://hack-or-snooze.herokuapp.com/stories',
    data: dataObj,
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(() => displayStories())
    .catch(err => console.log(err));
}

function deleteStory(event) {
  const storyID = $(event.target)
    .parent()
    .attr('id');
  const token = localStorage.getItem('token');

  $.ajax({
    method: 'DELETE',
    url: `https://hack-or-snooze.herokuapp.com/stories/${storyID}`,
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(() => {
      displayUserStories();
    })
    .catch(err => console.log(err));
}

function toggleFavorite(event) {
  const storyId = $(event.target)
    .parent()
    .attr('id');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  let method = 'POST';

  //is a favorite
  if ($(event.target).hasClass('fas')) {
    //remove from favorites list
    method = 'DELETE';
  }

  $.ajax({
    method: method,
    url: `https://hack-or-snooze.herokuapp.com/users/${username}/favorites/${storyId}`,
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => console.log(res))
    .catch(err => console.log(err));

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
}
