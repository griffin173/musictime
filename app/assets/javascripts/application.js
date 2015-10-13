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
var placesApi;
var markers = new Object();
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
$( document ).ready(function() {
initialize();
var input = document.getElementById('map-search');
var searchBox = new google.maps.places.SearchBox(input);
map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

// Bias the SearchBox results towards current map's viewport.
map.addListener('bounds_changed', function() {
  searchBox.setBounds(map.getBounds());
});
searchBox.addListener('places_changed', function() {
geocoder.geocode({'address': $( "#map-search" ).val()}, function(results, status) {
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
          addMarkerListeners(data)
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

              addMarkerListeners(data)
              bindButtons()
              $( ".results-container"  ).fadeTo( "slow" , 1)
            });
        }
    });


bindButtons()
 

 // map.addListener('dragend', function() {
 //    geocoder.geocode({'location': map.getCenter()}, function(results, status) {
 //    if (status === google.maps.GeocoderStatus.OK) {
 //      if (results[1]) {
 //        $( "#address-box" ).val(results[1].formatted_address);
 //      } else {
 //        window.alert('No results found');
 //      }
 //    } else {
 //      window.alert('Geocoder failed due to: ' + status);
 //    }
 //  });
 //  });

window.addEventListener('resize', positionElements);
positionElements();

});
function addMarkerListeners(html) {
  if (typeof(html) != "undefined" && html !== null) {
    gigs = $(html).filter(".gigResult")
  } else {
    gigs = $( ".gigResult" )
  }
  gigs.each(function( index ) {
    var test = $(this).find(".venue");
    var markerIndex = test.attr("data-marker-index");
    var gigId = ($(this).attr("id"));
    var myElement = document.getElementById($(this).attr("id"));

    var elementWatcher = scrollMonitor.create( myElement );

    elementWatcher.enterViewport(function() {
      if (gigId in markers) {
          markers[gigId].setMap(map)
      } else {
        var image = {
          url: "http://www.google.com/mapfiles/kml/paddle/"+markerIndex+".png",
          size: null,
          origin: null,
          anchor: null,
          scaledSize: new google.maps.Size(50, 50)
        };

        if (test.attr("data-lat")) {

          var address;
          address = {lat: Number(test.attr("data-lat")), lng: Number(test.attr("data-lng"))}
          var marker = new google.maps.Marker({
            position: address,
            icon: image,
            map: map
          });
          markers[gigId] = marker;
        } else {

          var address;

  
          placesApi.nearbySearch({location: map.getCenter(), name: test.attr("data-venue-name"), radius: 25000}, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              address = {lat: Number(results[0].geometry.location.lat()), lng: Number(results[0].geometry.location.lng())}
              var marker = new google.maps.Marker({
                position: address,
                icon: image,
                map: map
              });
              markers[gigId] = marker;
            } else {
            }
          });
        }

        
      }
    });
    elementWatcher.exitViewport(function() {
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
              var widget = $('#youtube-widget');
              widget.html(data);
              widget.parent('.player').addClass('visible');
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
              var widget = $('#youtube-widget');
              widget.html(data);
              widget.parent('.player').addClass('visible');
          });
     
    });
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


function initialize() {
  var myOptions = {
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map"), myOptions);

  placesApi = new google.maps.places.PlacesService(map);
  geocoder = new google.maps.Geocoder;
  infowindow = new google.maps.InfoWindow;
  // Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);

      addMarkerListeners()
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
