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
//= require_tree .
var initialLocation;
var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);//if people don't share location put them in new york

var map;
var geocoder;
var placesApi;
var selectedGig;
var markers = new Object(); // array of map markers to bounce/center on when user clicks icon in result list.
$( document ).ready(function() {
selectedGig=0;
initialize();

//put the search bar on the map
var input = document.getElementById('map-search');
var searchBox = new google.maps.places.SearchBox(input);
map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

// Bias the SearchBox results towards current map's viewport.
map.addListener('bounds_changed', function() {
  searchBox.setBounds(map.getBounds());
});
//when the search box has it's value changed, update the listings
searchBox.addListener('places_changed', function() {

  geocoder.geocode({'address': $( "#map-search" ).val()}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {

      map.setCenter(results[0].geometry.location);
      getListings()
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
});

//implement infinite scroll, load more when you scroll to bottom
$(window).on('scroll', function() {
  if($(window).scrollTop() == $(document).height() - $(window).height()) {
    loadmore();
  }
});

bindButtons()
 

//position the music player
window.addEventListener('resize', positionElements);
positionElements();

});

//load more results into the results container, appending them at the bottom. 
function loadmore() {
  //apply a fading animation while loading
  $( "#results-container"  ).fadeTo( "slow" , 0.3)
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
      $( "#results-container" ).append(data)

      addMarkerListeners(data)
      bindButtons()
      $( "#results-container"  ).fadeTo( "slow" , 1)
    });
}

//load in initial list of results
function getListings() {

  $( "#results-container"  ).fadeTo( "slow" , 0.3)
  $( "#results-container" ).html('');
  $.ajax({
    url: "/ajax",
    data: {
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng()
    }
  })
    .done(function( data ) {
      $( "#results-container" ).html(data)
      bindButtons();
      addMarkerListeners(data)
      $( "#results-container"  ).fadeTo( "slow" , 1)
    });
}

//place the markers on the map and apply listeners on the results list divs, so that markers appear
//or dissappear based on what results are showing on the list
//html is the string representation of the html that is appended during a loadmore, we want to just check through
//this instead of reapplying to markers that already exist.
function addMarkerListeners(html) {
  if (typeof(html) != "undefined" && html !== null) {
    html = $.parseHTML( html )
    gigs = $(html).find(".gigResult")

  } else {
    gigs = $( ".gigResult" )
  }
  gigs.each(function( index ) {
    var venue = $(this).find(".venue");
    var gigId = ($(this).attr("id"));
    //apply the scroll monitoring ability to each result div
    var myElement = document.getElementById($(this).attr("id"));
    var elementWatcher = scrollMonitor.create( myElement );

    elementWatcher.enterViewport(function() {
      if (gigId in markers) {
        // if marker exists already make it visible
        markers[gigId].setMap(map)
      } else {
        // create marker with given lat and long
        if (venue.attr("data-lat")) {
          var address;
          address = {lat: Number(venue.attr("data-lat")), lng: Number(venue.attr("data-lng"))}
          var marker = new google.maps.Marker({
            position: address,
            map: map
          });
          markers[gigId] = marker;
          marker.addListener('click', function() {
            $( ".gigResult#"+selectedGig ).removeClass("gig-selected")
            selectedGig = gigId;
            $( ".gigResult#"+gigId ).addClass("gig-selected")
          });
        } else {
          //if lat and long not provided try to find address from google places api based on venue name
          var address;
          placesApi.nearbySearch({location: map.getCenter(), name: venue.attr("data-venue-name"), radius: 25000}, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              address = {lat: Number(results[0].geometry.location.lat()), lng: Number(results[0].geometry.location.lng())}
              var marker = new google.maps.Marker({
                position: address,
                map: map
              });
              markers[gigId] = marker;
              marker.addListener('click', function() {

                $( ".gigResult#"+selectedGig ).removeClass("gig-selected")
                selectedGig = gigId;
                $( ".gigResult#"+gigId ).addClass("gig-selected")
              });
            } else {
            }
          });
        }

        
      }
    });
    elementWatcher.exitViewport(function() {
      //hide marker as result exits view
      if (gigId in markers) 
        markers[gigId].setMap(null)
    });
  });
}
function positionElements() {
    $('#map-container').css('height', window.innerHeight);
    // center the player inside the map
    $('.player').first().css('top', (window.innerHeight - 445)/2);
    $('.player').first().css('left', ($('#map-container').width() - 340)/2);
}
//bind the buttons for each result
function bindButtons() {
  $('[data-toggle="tooltip"]').tooltip();
  //remove any current bindings
  $( ".spotify-list" ).off( "click", "**" );
  $( ".youtube-search" ).off( "click", "**" );
  //load in a spotify playlist for the concert
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
        var widget = $('#youtube-widget');
        widget.html(data);
        widget.parent('.player').addClass('visible');
      });
	   
	  });
  // load in a youtube window for the band
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
            var widget = $('#youtube-widget');
            widget.html(data);
            widget.parent('.player').addClass('visible');
        });
   
  });
  //clicking on a map marker icon in the results centers on the marker on the map and bounces
  $( ".map-marker" ).click(function() {
    event.stopPropagation()
    event.preventDefault()
    marker = markers[$(this).attr("data-songkick-id")]
    map.setCenter(marker.getPosition());
    marker.setAnimation(google.maps.Animation.BOUNCE);

    setTimeout(function() {
        marker.setAnimation(null)
    }, 2220);
     
  });
}

//initialize the google maps and location and load initial results
function initialize() {
  var draggable = true;
  //disable map drag on touch devices or you can get stuck on the map by zooming in
  if (Modernizr.touchevents) 
    draggable=false;
  var myOptions = {
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: draggable
  };
  //load google maps and services
  map = new google.maps.Map(document.getElementById("map"), myOptions);

  placesApi = new google.maps.places.PlacesService(map);
  geocoder = new google.maps.Geocoder;
  // Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
      getListings();
    }, function() {
      handleNoGeolocation();
    });
  }
  // Browser doesn't support Geolocation
  else {
    handleNoGeolocation();
  }
  //if we don't know where they are put them in new york
  function handleNoGeolocation() {
    initialLocation = newyork;
    map.setCenter(initialLocation);
    getListings();
  }
}
