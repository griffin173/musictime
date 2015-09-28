class MusictimeController < ApplicationController
  geocode_ip_address

  require 'api_manager'
  def home 
  	api_manager = ApiManager.new '01Q2xyzpKWuaMeI6'
    results = api_manager.get_location_results('Ottawa, Canada')
    @test = results[:results]
    @metro = results[:metro_id]
  	if geo = session[:geo_location]
      @ipaddress = geo;

    end


  end
  def get_results
    	locationLat = params[:lat]
    	locationLng = params[:lng]
      api_manager = ApiManager.new '01Q2xyzpKWuaMeI6'

    	
      results = api_manager.get_location_geo_results(locationLat,locationLng)
      @results = results[:results]
      @metro = results[:metro_id]
	  	render :layout => false
    end
  def load_more
      metro = params[:metroId]
      page = params[:page]
      api_manager = ApiManager.new '01Q2xyzpKWuaMeI6'
      @results = api_manager.get_more_results_by_metro(metro, page)
      render 'pages/ajax', :layout => false
    end
  def songlist
    remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
    showId = params[:songkickID]
    show = remote.event(showId)
    bands = Array.new
    @spotifySongIds = Array.new
    show.performances.each do |performance|
      bands.push(performance.artist.display_name)
    end


    bands.each do |band|
      artists = RSpotify::Artist.search(band)
      if artists.blank? then
      	next
      end
      artist = artists.first
      topTracks = artist.top_tracks(:US).first(3)
      topTracks.each do |spotifyTrack|
        @spotifySongIds.push(spotifyTrack.id)
      end
    end
    @spotifySongIds = @spotifySongIds.join(',')
    render :layout => false

    end
  def youtube_search
    remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
    showId = params[:songkickBandID]
    band = remote.artist(showId)
    @query= CGI.escape(band.display_name)
    render :layout => false



     end


end
