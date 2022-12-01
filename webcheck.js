import got from 'got';
import Discord from "./clientpool.js";

export class WebsiteCheckEngine {
    website_url = null;
    channel = null;
    is_ready = false;

    constructor() {
    }

    async ready(configobj) {
        this.website_url = configobj.website_url;
        this.client = await Discord.getClient(configobj.bot_token);
        this.channel = await this.client.channels.fetch(configobj.status_channel_id);
        // If the channel is not found, then log an error and exit process
        if (!this.channel) {
            throw new Error('Bot is not in the channel to send edit');
        }
        this.is_ready = true;
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
        const check = await this.do_check(this.website_url);
        console.log(check);
        // If the check comes back the website is down
        if (check['ok']) {
            // If it is up, log it and update the channel title+
            console.log('Website is up');
            await this.check_succedded(check);
        } else {
            console.log('Website is down');
            await this.check_failed(check);
        }
    }

    async check_failed(check) {
        await this.discord_notify_down(check.response_code);
    }

    async check_succedded(check) {
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

