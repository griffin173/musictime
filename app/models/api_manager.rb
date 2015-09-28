class ApiManager
  def initialize(songkickr_key)
    @songkickr_api = Songkickr::Remote.new songkickr_key
    
  end
  def get_location_results location
    songkick_location = @songkickr_api.location_search(:query => location)
    metro_id = songkick_location.results.first.metro_area.id
    return {:results => @songkickr_api.metro_areas_events(metro_id), :metro => metro_id}
  end

  def get_location_geo_results locationLat, locationLng
    songkick_location = @songkickr_api.location_search_geo(locationLat,locationLng)
    metro_id = songkick_location.results.first.metro_area.id
    return {:results => @songkickr_api.metro_areas_events(metro_id), :metro => metro_id}
  end
  def method_name metro_id, page_number
    return @songkickr_api.metro_areas_events(metro_id, :page =>page_number).results
  end

  def persisted?
    false
  end

end