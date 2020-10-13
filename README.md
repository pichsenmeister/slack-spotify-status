# slack-spotify-status

A simple Slack app that updates your Slack status to the song you currently listen to on Spotify.

This app uses the [Bolt for Slack](https://slack.dev/bolt/concepts) framework.

## Spotify configuration

1. Create a Spotify app [here](https://developer.spotify.com/dashboard/applications)
2. Set `REDIRECT_URL` to your glitch project url `https://<your-project>.glitch.me/spotify/oauth` 
3. Copy `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REDIRECT_URL` to your `.env` variables
4. Get an access token by going through the OAUTH flow `https://<your-project>.glitch.me/spotify/connect`
5. Copy to token to `SPOTIFY_REFRESH_TOKEN` in your `.env` file
    

## Slack app configuration

1. Create an [app](https://api.slack.com/apps) on Slack
2. Add `User Token Scopes` in `OAuth & Permissions`
  - `users.profile:read`
  - `users.profile:write`
3. Install App
4. Copy User Token to `SLACK_USER_TOKEN` in your `.env` file

## Run the app

1. Install dependencies via `npm` or `yarn`
2. Create a `.env` file and make sure to set all variables
  - `SLACK_USER_TOKEN=<your Slack app's user token>`
  - `SPOTIFY_CLIENT_ID=<your Spotify app's client id>`
  - `SPOTIFY_CLIENT_SECRET=<your Spotify app's client secret>`
  - `SPOTIFY_REDIRECT_URL=<your Spotify app's redirect url>`
  - `SPOTIFY_REFRESH_TOKEN=<your Spotify access token>`
3. Create a cronjob (or something similar) that calls `/ping` to update your status  

## Remix on Glitch

[Remix on Glitch](https://glitch.com/edit/#!/remix/slack-spotify-status)