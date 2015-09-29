class ApiManager
  def initialize(songkickr_key)
    @songkickr_api = Songkickr::Remote.new songkickr_key
    
  end
  def get_location_results location
    songkick_location = @songkickr_api.location_search(:query => location)
    metro_id = songkick_location.results.first.metro_area.id
    shows = @songkickr_api.metro_areas_events(metro_id).results
    return {:results => shows, :metro_id => metro_id}
  end

  def get_location_geo_results locationLat, locationLng
    songkick_location = @songkickr_api.location_search_geo(locationLat,locationLng)
    metro_id = songkick_location.results.first.metro_area.id
    shows = @songkickr_api.metro_areas_events(metro_id).results
    return {:results => shows, :metro_id => metro_id}
  end
  def get_more_results_by_metro metro_id, page_number
    return @songkickr_api.metro_areas_events(metro_id, :page =>page_number).results
  end
  def get_spotify_playlist_for_show showId

    show = @songkickr_api.event(showId)
    bands = Array.new
    spotify_song_ids = Array.new
    show.performances.each do |performance|
      bands.push(performance.artist.display_name)
    end


    bands.each do |band|
      artists = RSpotify::Artist.search(band)
      if artists.blank? then
        next
      end
      artist = artists.first
      top_tracks = artist.top_tracks(:US).first(3)
      top_tracks.each do |spotify_track|
        spotify_song_ids.push(spotify_track.id)
      end
    end
    return spotify_song_ids.join(',')
  end
  def get_band_name_from_songkick_id(band_id)
    band = @songkickr_api.artist(band_id)
    return band.display_name

  end

  def persisted?
    false
  end

end