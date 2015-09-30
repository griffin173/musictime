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

$( "#update-button" ).click(function() {
geocoder.geocode({'address': $( "#address-box" ).val()}, function(results, status) {
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
          $( ".results-container" ).html(data)
          bindButtons();
        });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });



});
$(window).on('scroll', function() {
        if($(window).scrollTop() == $(document).height() - $(window).height()) {
          $( ".results-container"  ).fadeTo( "slow" , 0.3)
          $.ajax({
            url: "/loadmore",
            data: {
              metro_id: $('#metro-id').attr('data-metro'),
              page: $('#page').attr('data-page-number'),
              start_day: $(".seperator" ).last().text()
            }
          })
            .done(function( data ) {
              var pageNumber = $('#page').attr('data-page-number')
              pageNumber++
              $('#page').attr('data-page-number', pageNumber)
              $( ".results-container" ).append(data)
              bindButtons()
              $( ".results-container"  ).fadeTo( "slow" , 1)
            });
        }
    });

bindButtons()


 map.addListener('dragend', function() {
    geocoder.geocode({'location': map.getCenter()}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        $( "#address-box" ).val(results[1].formatted_address);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
  });
 var input = /** @type {!HTMLInputElement} */(
      document.getElementById('address-box'));
  var autocomplete = new google.maps.places.Autocomplete(input);






});

function bindButtons() {
  $( ".spotify-list" ).off( "click", "**" );
  $( ".youtube-search" ).off( "click", "**" );
  	$( ".spotify-list" ).click(function() {
    event.stopPropagation()
	  event.preventDefault()
	      $.ajax({
	        url: "/songlist",
	        data: {
	          songkick_show_id: $(this).attr('data-songkick-id')
	        }
	      })
	        .done(function( data ) {
	          $( "#youtube-widget" ).html(data)
	        });
	   
	  });
    $( ".youtube-search" ).click(function() {
    event.stopPropagation()
    event.preventDefault()
        $.ajax({
          url: "/youtubesearch",
          data: {
            songkick_band_id: $(this).attr('data-songkick-band-id')
          }
        })
          .done(function( data ) {
            $( "#youtube-widget" ).html(data)
          });
     
    });
}


function initialize() {
  var myOptions = {
    zoom: 11,
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
