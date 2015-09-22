// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require bootstrap-sprockets
//= require underscore
//= require gmaps/google
//= require turbolinks
//= require_tree .
var initialLocation;
var siberia = new google.maps.LatLng(60, 105);
var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
var browserSupportFlag =  new Boolean();
var map;
var geocoder;
var infowindow;
$( document ).ready(function() {
initialize();

$( "#updateButton" ).click(function() {
geocoder.geocode({'address': $( "#addressBox" ).val()}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      $.ajax({
        url: "/ajax",
        data: {
          lat: map.getCenter().lat(),
          lng: map.getCenter().lng()
        }
      })
        .done(function( data ) {
          $( ".resultsContainer" ).html(data)
        });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });



});
$('.resultsContainer').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
          $.ajax({
            url: "/loadmore",
            data: {
              metroId: $('#metro-id').attr('data-metro'),
              page: $('#page').attr('data-page-number')
            }
          })
            .done(function( data ) {
              var pageNumber = $('#page').attr('data-page-number')
              pageNumber++
              $('#page').attr('data-page-number', pageNumber)
              $( ".resultsContainer" ).append(data)
            });
        }
    });
$( ".spotify-list" ).click(function() {
  event.stopPropagation()
      $.ajax({
        url: "/songlist",
        data: {
          songKickID: $(this).attr('data-songkick-id')
        }
      })
        .done(function( data ) {
          $( "#spotify-widget" ).html(data)
        });
   
  });



 map.addListener('dragend', function() {
    geocoder.geocode({'location': map.getCenter()}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        $( "#addressBox" ).val(results[1].formatted_address);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
  });
 var input = /** @type {!HTMLInputElement} */(
      document.getElementById('addressBox'));
  var autocomplete = new google.maps.places.Autocomplete(input);






});



function initialize() {
  var myOptions = {
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map"), myOptions);

  geocoder = new google.maps.Geocoder;
  infowindow = new google.maps.InfoWindow;
  // Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  }
  // Browser doesn't support Geolocation
  else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      initialLocation = newyork;
    } else {
      initialLocation = siberia;
    }
    map.setCenter(initialLocation);
  }
}
