require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const axios = require("axios");
const qs = require("querystring");

const expressReceiver = new ExpressReceiver({});
const app = new App({
  // authorize: oauth.authorize,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_USER_TOKEN,
  receiver: expressReceiver,
  logLevel: "DEBUG"
});

const express = expressReceiver.app;

// set your status emoji (this is a custom emoji)
const EMOJI = ':spotify:'

express.get("/spotify/connect", async (req, res) => {
  const scopes = "user-read-currently-playing user-read-playback-state";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      process.env.SPOTIFY_CLIENT_ID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(process.env.SPOTIFY_REDIRECT_URL)
  );
});

express.get("/spotify/oauth", async (req, res) => {
  const result = await getSpotifyToken({
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URL
  });
  return res.send(result.refresh_token);
});

const base64 = data => {
  const buff = Buffer.from(data);
  return buff.toString("base64");
};

const getSpotifyToken = async body => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          base64(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          )
      }
    };

    const result = await axios.post(
      `https://accounts.spotify.com/api/token`,
      qs.stringify(body),
      config
    );
    return result.data;
  } catch (err) {
    return console.error(err.response.data);
  }
};

const getSpotifyStatus = async () => {
  const token = await getSpotifyToken({
    grant_type: "refresh_token",
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  });

  const config = {
    headers: {
      Authorization: "Bearer " + token.access_token
    }
  };
  const result = await axios.get(
    `https://api.spotify.com/v1/me/player/currently-playing`,
    config
  );
  return result.data;
};

// poll function to update status
express.get("/ping", async (req, res) => {
  console.log("<3");
  res.send({ping: "pong"});
  
  const spotifyInfo = await getSpotifyStatus();

  if (spotifyInfo.is_playing) {
    const song = {
      name: spotifyInfo.item.name,
      artists: spotifyInfo.item.artists
        .map(artist => artist.name)
        .join(" & ")
    };

    await setStatus(song, EMOJI);

    return song;
  } else {
    const status = await getSlackStatus();
    // only unset status if it's a spotify status
    if (isSpotifyStatus(status)) await unsetStatus();
  }
  return 
});

// check if the current Slack status is a spotify status
const isSpotifyStatus = status => {
  return status.emoji === EMOJI;
};

const getSlackStatus = async () => {
  const profile = await app.client.users.profile.get({
    token: process.env.SLACK_USER_TOKEN
  });
  return {
    emoji: profile.profile.status_emoji,
    text: profile.profile.status_text
  };
};

const unsetStatus = async () => {
  await app.client.users.profile.set({
    token: process.env.SLACK_USER_TOKEN,
    profile: {
      status_text: "",
      status_emoji: ""
    }
  });
};

const setStatus = async (song, emoji) => {
  let statusText = `listening to ${song.name} by ${song.artists}`
  if(statusText.length > 100) statusText = statusText.substring(0, 97)+'...'
  await app.client.users.profile.set({
    token: process.env.SLACK_USER_TOKEN,
    profile: {
      status_text: statusText,
      status_emoji: `${emoji}`,
      status_expiration: 0
    }
  });
};

app.error(error => {
  console.error(error);
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
