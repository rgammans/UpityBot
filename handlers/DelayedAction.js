import { WebsiteCheckEngine } from '../webcheck.js';
import fs from 'fs/promises';


// The different 'states' we track. +ve is working.
// consts..
const STATE_UP = 1;
const STATE_DOWN = 0;
const STATE_STILL_DOWN = -1;
const STATE_REALLY_DOWN = -2;


/** DelayActionChecker - A checker which runs a action
  *
  * Specifically it runs the action the second time it
  * finds the website down so it doesn't try the fix on
  * transensitive errors.
  *
  *  Takes an addtional optional config value `fixfail_msg`,
  *  this should be a string which is included in the notification
  *  if the next check following the fix fails.
  */
export class DelayedActionChecker extends WebsiteCheckEngine {
    current_state = STATE_DOWN;

    async check_failed(check) {
        if (this.current_state == STATE_REALLY_DOWN) {
            return;
        }
        this.current_state = this.current_state - 1;
        switch (this.current_state) {
            case STATE_DOWN:
                await this.discord_notify_down(" - just down, waiting to see it it fixes itself");
                break;
            case STATE_STILL_DOWN:
                 let promise1 = this.discord_notify_down(" - still down after delay. Attempting autofix, this could take a few minutes - I wil get back to you.");
                 let promise2 = this.do_fix();
                 try {
                    await Promise.all([promise1, promise2]);
                } catch (e) {
                    await this.channel.send(`Attempt to fix failed - ${e}`);
                }
                break;
            case STATE_REALLY_DOWN:
                await this.discord_notify_down(` - still down after autofix. ${this.config.fixfail_msg || ""}`);
                break;
        }
    }

    async check_succeeded(check) {
        console.log(`Sucess <- ${this.current_state}`);
        if (this.current_state == STATE_UP) {
            // Don't give lots of it's still up  notifs
            return;
        }
        this.current_state = STATE_UP;
        await this.discord_notify_up(`Yay! We got ${check.response_code}`);
    }

    /** Override this aync function to code the fix action
    */
    do_fix() {}
};
