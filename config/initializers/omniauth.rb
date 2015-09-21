# config/initializers/omniauth.rb

require 'rspotify/oauth'

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :spotify, "48daea54f34846d9a1ebd1cfdcdb4d6f", "bbff12099330448f8e004fa78d38eb56", scope: 'user-read-email playlist-modify-public user-library-read user-library-modify'
end