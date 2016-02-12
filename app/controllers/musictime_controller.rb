class MusictimeController < ApplicationController
  before_filter :set_api
  require 'api_manager'

  def set_api
    @api_manager = ApiManager.new '01Q2xyzpKWuaMeI6'
  end

  def home 
    results = []
    @display_results = []
    @metro = []
    @start_day = 0
  end

  def get_results
  	location_lat = params[:lat]
  	location_lng = params[:lng]
    @mobile = params[:mobile]

  	
    results = @api_manager.get_location_geo_results(location_lat,location_lng)
    @results = results[:results]
    @metro = results[:metro_id]
    @start_day = 0
  	render :layout => false
  end

  def load_more
    metro = params[:metro_id]
    page = params[:page]
    @start_day = params[:start_day].to_date.day
    @results = @api_manager.get_more_results_by_metro(metro, page)
    render 'musictime/get_results', :layout => false
  end

  def songlist

    show_id = params[:songkick_show_id]
    @spotifySongIds = @api_manager.get_spotify_playlist_for_show(show_id)
    render :layout => false
  end

  def youtube_search
    band_id = params[:songkick_band_id]
    band_name = @api_manager.get_band_name_from_songkick_id(band_id)
    @query= CGI.escape(band_name)
    render :layout => false
  end


end
