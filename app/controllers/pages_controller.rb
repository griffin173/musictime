class PagesController < ApplicationController
  geocode_ip_address
  def home
  	remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
  	songkickloc = remote.location_search(:query => 'Ottawa, Canada')
  	metro = songkickloc.results.first.metro_area.id
  	@test = remote.metro_areas_events(metro)
  	if geo = session[:geo_location]
      @ipaddress = geo;

    end


  end
  def ajax
    	locationLat = params[:lat]

    	locationLng = params[:lng]
    	remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
	  	songkickloc = remote.location_search_geo(locationLat,locationLng)
	  	metro = songkickloc.results.first.metro_area.id
	  	@results = remote.metro_areas_events(metro).results
	  	render :layout => false
    end
end
