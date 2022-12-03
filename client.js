import DiscordJS from 'discord.js';


/**
  * A simple singletem for discord clients objects, 
  * returns a single unique instance of a Discord client.
  *
  * The function 'blocks' until the client is 'ready'.
  */
var Discord = (function () {
    var _client;

    function createClient() {
        let client = new DiscordJS.Client();
        let wait_token = client.login(process.env.DISCORD_BOT_TOKEN);
        return {
            'wait': wait_token,
            'client': client
        }
    }

    return {
        getClient: async function (token) {
            if (!_client) {
                _client = createClient();
            }
            await _client.wait;
            return _client.client;
        }
    };
})();
export default Discord;
