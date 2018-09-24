const vorpal = require('vorpal')();
const fetch = require('cross-fetch');

const config = require('./config');
const TWITCH_API_URL = 'https://api.twitch.tv/helix';
const TWITCH_LOGIN_ENDPOINT = 'users?login=';
const TWITCH_CLIENT_ID = config.clientID;

const getDataFromTwitch = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
      }
    });
    const resp = await response.json();
    return resp;
    
  } catch (err) { 
    console.error(err);
  }
}

const getUserId = async (user) => {
  try {
    const response = await getDataFromTwitch(`${TWITCH_API_URL}/${TWITCH_LOGIN_ENDPOINT}${user}`);
    const userId = await response.data[0].id;
    return userId;
  } catch (err) { 
    console.error(err);
  }
}

const getUserIds = (usersArray) => new Promise((resolve, reject) => {
  try {
    let IdArray = [];

    usersArray.forEach((user, index) => {
      if (index == usersArray.length - 1) {
        setTimeout(async function() {
          getUserId(user)
            .then((userId) => {
              IdArray.push(userId);
              resolve(IdArray.join(", "));
            });
        }, 2000 * index);
      } else {
        setTimeout(async function() {
          getUserId(user)
            .then((userId) => {
              IdArray.push(userId);
            });
        }, 2000 * index);
      }
    });
  } catch (err) {
    reject(err);
  }
});

vorpal
  .delimiter('twitch-extension-tools$')
  .show();

vorpal
  .command('getUserIds <twitchUsernames...>')
  .description('Retrieves Twitch IDs for one or more usernames separated by space')
  .alias('gids')
  .action(function(args, callback) {
    const self = this;
    getUserIds(args.twitchUsernames)
      .then((userIds) => {
        self.log(userIds);
        callback();
      })
      .catch(err => console.error(err));
  });