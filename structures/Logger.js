// structures/
const chalk = require('chalk');
const moment = require('moment');

class Logger {
    get timestamp() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }

    log(content) {
        console.log(chalk.blue(`[${this.timestamp}] [LOG] ${content}`));
    }

    success(content) {
        console.log(chalk.green(`[${this.timestamp}] [SUCCESS] ${content}`));
    }

    warn(content) {
        console.log(chalk.yellow(`[${this.timestamp}] [WARN] ${content}`));
    }

    error(content) {
        console.log(chalk.red(`[${this.timestamp}] [ERROR] ${content}`));
    }

    debug(content) {
        if (require('../config').logging.debug) {
            console.log(chalk.magenta(`[${this.timestamp}] [DEBUG] ${content}`));
        }
    }

    command(user, command, args, guild) {
        console.log(chalk.cyan(`[${this.timestamp}] [COMMAND] ${user} used ${command} ${args} in ${guild}`));
    }

    event(event, details) {
        if (require('../config').logging.events) {
            console.log(chalk.grey(`[${this.timestamp}] [EVENT] ${event}: ${details}`));
        }
    }
}

module.exports = Logger;
