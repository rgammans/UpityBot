import DiscordJS from 'discord.js';

class DiscordPool {

    constructor() {
        this.clients = new Map();
    }

    get(token) {
        var cache_val = this.clients.get(token);
        if (! cache_val ) {
            let client = new DiscordJS.Client();
            let wait_token = client.login(token);
            cache_val = {
                'wait': wait_token,
                'client': client
            }
            this.clients.set(cache_val);
        }
        return cache_val;
    }


}
/**
  * A simple pool for discord clients, each bot's token
  * returns a single unique instance of a Discord client.
  *
  * The function 'blocks' until the client is 'ready'.
  */
var Discord = (function () {
    var _pool;

    function createPool() {
        var object = new DiscordPool();
        return object;
    }

    return {
        getClient: async function (token) {
            if (!_pool) {
                _pool = createPool();
            }
            let result = _pool.get(token);
            await result.wait;
            return result.client;
        }
    };
})();
export default Discord;
