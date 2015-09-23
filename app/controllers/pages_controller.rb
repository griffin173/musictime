class PagesController < ApplicationController
  geocode_ip_address
  def home
  	remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
  	songkickloc = remote.location_search(:query => 'Ottawa, Canada')
  	@metro = songkickloc.results.first.metro_area.id
  	@test = remote.metro_areas_events(@metro)
  	if geo = session[:geo_location]
      @ipaddress = geo;

    end


  end
  def ajax
    	locationLat = params[:lat]

    	locationLng = params[:lng]
    	remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
	  	songkickloc = remote.location_search_geo(locationLat,locationLng)
	  	@metro = songkickloc.results.first.metro_area.id
	  	@results = remote.metro_areas_events(@metro).results
	  	render :layout => false
    end
  def loadmore
      metro = params[:metroId]
      page = params[:page]
      remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
      @results = remote.metro_areas_events(metro, :page =>page).results
      render 'pages/ajax', :layout => false
    end
  def songlist
    remote = Songkickr::Remote.new '01Q2xyzpKWuaMeI6'
    showId = params[:songKickID]
    show = remote.event(showId)
    bands = Array.new
    @spotifySongIds = Array.new
    show.performances.each do |performance|
      bands.push(performance.artist.display_name)
    end


    bands.each do |band|
      artists = RSpotify::Artist.search(band)
      artist = artists.first
      topTracks = artist.top_tracks(:US).first(3)
      topTracks.each do |spotifyTrack|
        @spotifySongIds.push(spotifyTrack.id)
      end
    end
    @spotifySongIds = @spotifySongIds.join(',')
    render :layout => false

    end


  def topssongs
    artists = RSpotify::Artist.search('Arctic Monkeys')

    arctic_monkeys = artists.first
    arctic_monkeys.popularity
    @trackId = arctic_monkeys.top_tracks(:US).first.id
  end
end
