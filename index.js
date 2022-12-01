import { WebsiteCheckEngine } from './webcheck.js';
import schedule from 'node-schedule';
import { configs } from './config.js';

async function main() {
    for (let check of configs) {
        let Class = check['class'] || WebsiteCheckEngine ;
        let checker = new Class();
        await checker.ready(check);
        schedule.scheduleJob(
            check["schedule"],
            function(){
                console.log(`Checking Status of site ${check["website_url"]}`);
                checker.run_check();
            }
        )
    }
}

main( configs );
