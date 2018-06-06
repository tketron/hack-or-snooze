let $links;

$(function() {
  $('#submitText').on('click', function() {
    $('.form').slideToggle();
  });
  $('#favoritesText').on('click', toggleFavorites);
  $links = $('.link-row');
  $('.container').on('submit', '#submitForm', function(event) {
    event.preventDefault();
    addNewLink();
  });

  $('ol').on('click', '.star', toggleFavoriteIcon);
  $('ol').on('click', '.link', function(event) {
    showHostnameLinks($(event.target).text());
  });
});

function addNewLink() {
  //pull data from form
  let title = $('#title').val();
  let url = $('#url').val();

  //append to list
  let $newLink = $(
    `<li class="link-row"><i class="star far fa-star"></i><a href=${url}>${title}</a><span class="link">(${url})</span></li>`
  );
  $('#links').append($newLink);
  $links = $('.link-row');

  //clear form
  $('#title').val('');
  $('#url').val('');
}

function toggleFavoriteIcon() {
  console.log(event.target);
  $(event.target).toggleClass('far fas');
  $(event.target)
    .parent()
    .toggleClass('favorite');
}

function toggleFavorites() {
  if ($('#links').hasClass('all')) {
    let $favorites = $('.link-row').filter('.favorite');
    $('#links').empty();
    $('#links').append($favorites);
    $('#favoritesText').text('all');
  } else {
    $('#links').empty();
    $('#links').append($links);
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
