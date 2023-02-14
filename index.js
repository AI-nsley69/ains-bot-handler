import { Client, GatewayIntentBits } from 'discord.js';
import { Logger } from './logger.js';
import fs from 'fs';
import { resolve, basename } from 'path';

class Options {
    constructor(token, prefix) {
        if (!token) throw new Error('Missing bot token!');
        else if (typeof(token) !== 'string') throw new Error('Bot token must be a string!');
        else this.token = token;

        if (!prefix) throw new Error('Missing bot prefix!');
        else if (typeof(token) !== 'string') throw new Error('Bot prefix must be a string!');
        else this.prefix = prefix;

        this.intents = [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
        ];

        this.paths = {};
        this.paths.commands = resolve('commands');
        this.paths.events = resolve('events');
    }

    addIntents(intents) {
        const isArray = intents instanceof Array;
        if (!isArray) throw new Error('Intents must be an array!');
        else for (let i = 0; i < intents.length; i++) {
            const intent = intents[i];
            const isValidIntent = intent in GatewayIntentBits;
            if (!isValidIntent) {
                throw new Error(`${intent} is not a valid GatewayIntentBits!`);
            } else if (!intents.has(intent)) {
                this.intents.push(intent);
            }
        }
    }

    addLogger(loggerOptions) {
        const { level, file } = loggerOptions;
        const isValidLevel = (['warn', 'err', 'info']).includes(level);
        if (!level || !isValidLevel) throw new Error('Missing log level!');

        this.logger = {
            level: level,
            file: file,
        };

        return this;
    }

    setCommandsPath(path) {
        basename(resolve(process.cwd()));
        path = resolve(path);

        if (!fs.existsSync(path)) {
            throw new Error(`${path} does not exist!`);
        }
        else this.paths.commands = path;

        return this;
    }

    setEventsPath(path) {
        basename(resolve(process.cwd()));
        path = resolve(path);
        
        if (!fs.existsSync(path)) {
            throw new Error(`${path} does not exist!`);
        }
        else this.paths.events = path;

        return this;
    }
}

class Bot {
    constructor(options) {
        if (!(options instanceof Options)) throw new Error('Bot options is not the Options class!');
        this.client = createDiscordClient(options.token, options.intents);
        this.logger = createLogger(options.logger);

        const promises = [];
        
        this.commandGroups = getCommandGroups(options.paths.commands);

        this.commands = loadCommands(options.paths.commands, this.commandGroups);
        promises.push(this.commands);
    }
}

function createDiscordClient(token, intents) {
    const client = new Client({
        intents: intents,
    });

    client.login(token);

    return client;
}

function createLogger(options) {
    if (!options) return null;
    const logger = new Logger(options);
    logger.info('Hello there, General Kenobi!');

    return logger;
}

function getCommandGroups(path) {
    const groups = fs.readdirSync(path, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    return groups;

}

async function loadCommands(path, groups) {
    const commands = new Map();

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const pathWithGroup = `${path}/${group}`;

        const cmdsInGroup = fs.readdirSync(pathWithGroup)
            .filter(f => f.endsWith('.js'));

      for (let j = 0; i < cmdsInGroup.length; j++) {
        const name = cmdsInGroup[j];
        const fullPath = `${pathWithGroup}/${name}`;
        const cmd = await import(fullPath);

        cmd.default.setGroup(group);
        const cleanName = name.replace('.js', '');
        commands.set(cleanName, cmd.default);
      }  
    }

    return commands;
}

export { Bot, Options };