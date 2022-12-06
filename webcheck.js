import got from 'got';
import Discord from "./client.js";

export class WebsiteCheckEngine {
    channel = null;
    config = null
    is_ready = false;
    constructor(configobj) {
        this.config = configobj
    }

    async ready() {
        this.client = await Discord.getClient();
        this.channel = await this.client.channels.fetch(this.config.status_channel_id);
        // If the channel is not found, then log an error and exit process
        if (!this.channel) {
            throw new Error('Bot is not in the channel to send edit');
        }
        this.is_ready = true;
        return this;
    }

    async do_check(addr) {
        if (!this.is_ready) {
            // Don't do anything until discord client has connected
            console.log(`check running before client ready (${addr}`);
            return
        }
        // The original used the 'is-up' module, but since whole response
        // could ben useful for custom response.
        let results = await got(`https://isitup.org/${addr}.json`, {
            headers: {
                'user-agent': 'https://github.com/rgammans/upitybot',
            },
        }).json();
        return {
            "ok": results['status_code'] == 1,
            ... results
        }
    }

    async run_check(){
        // Get the channel that we want to edit from config.json
        //If we found it then run an up check
        const check = await this.do_check(this.config.website_url);
        // If the check comes back the website is down
        if (check['ok']) {
            // If it is up, log it and update the channel title+
            console.log('Website is up');
            await this.check_succeeded(check);
        } else {
            console.log('Website is down');
            await this.check_failed(check);
        }
    }

    async check_failed(check) {
        await this.discord_notify_down(check.response_code);
    }

    async check_succeeded(check) {
        await this.discord_notify_up(check.response_code);
    }

    discord_notify_down(suffix) {
        // Log it and update the channel title
        return this.channel.send(` 🔴 Status ${suffix}`);
    }

    discord_notify_up(suffix) {
        return this.channel.send(` 🟢 Status ${suffix}`);
    }

}

