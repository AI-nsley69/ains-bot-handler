import fs from 'fs';
import chalk from 'chalk';

const Level = {
    info: 0,
    warn: 1,
    error: 2,
};

function colorify(level) {
    switch(level) {
        case 'info':
            return chalk.greenBright('INFO');
        case 'warn':
            return chalk.yellowBright('WARN');
        case 'error':
            return chalk.redBright('ERROR');
    }
}

class Logger {
    constructor(options) {
        const { level, file } = options;

        this.level = level.toLowerCase();
        this.levelInt = Level[this.level];
        this.file = file;

        this.updateTime();
    }

    updateTime() {
        const date = new Date();
		this.dateString = date.toLocaleString('default', {
            month: 'long',
            day: 'numeric',
        });
		this.timeString = date.toTimeString().split(' ')[0];
    }

    consoleLog(msg, level) {
        const date = `${chalk.cyanBright(this.dateString)} ${chalk.magentaBright(this.timeString)}`;
        const brand = `[${chalk.yellowBright('LOG')}/${colorify(level)}]`;
        const log = `${date} ${brand}: ${msg}`;

        console.log(log);
    }

    fileLog(msg, level) {
        const date = `${this.dateString} ${this.timeString}`;
        const brand = `[LOG/${level}]`;
        const log = `${date} ${brand}: ${msg}`;

        fs.appendFile(this.file, `${log}\n`, err => {
            if (err) throw err;
        })
    }

    log(msg, level) {
        this.updateTime();
        this.consoleLog(msg, level);
        this.fileLog(msg, level);
    }

    error(msg) {
        this.log(msg, 'error');
    }

    warn(msg) {
        const warnLevel = 1
        if (this.levelInt > warnLevel) return;
        else this.log(msg, 'warn');
    }

    info(msg) {
        const infoLevel = 0;
        if (this.levelInt > infoLevel) return;
        else this.log(msg, 'info');
    }
}

export { Logger };