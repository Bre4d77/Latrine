const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const addonsPath = path.join(__dirname, '..', 'addons');

    if (!fs.existsSync(addonsPath)) {
        console.error('Addons directory not found.');
        return;
    }

    const addonFolders = fs.readdirSync(addonsPath);
    console.log(`Found addons: ${addonFolders.join(', ')}`);

    for (const addon of addonFolders) {
        const addonPath = path.join(addonsPath, addon);
        const addonFile = path.join(addonPath, 'index.js');
        

        if (fs.existsSync(addonFile)) {
            try {
                
                const addonModule = require(addonFile);
                
                await addonModule.init(client);

                // Load addon commands
                const commandsPath = path.join(addonPath, 'commands');
                
                if (fs.existsSync(commandsPath)) {
                    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                    for (const file of commandFiles) {
                   
                        const command = require(path.join(commandsPath, file));
                        command.addon = addon;
                        client.commands.set(command.name, command);
                    }
                } else {
                    console.log(`No commands directory found for addon: ${addon}`);
                }

                // Load addon events
                const eventsPath = path.join(addonPath, 'events');
                
                if (fs.existsSync(eventsPath)) {
                    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
                    
                    for (const file of eventFiles) {
                 
                        const event = require(path.join(eventsPath, file));
                        const eventName = file.split('.')[0];
                        client.on(eventName, (...args) => event.execute(client, ...args));
                    }
                } else {
                    console.log(`No events directory found for addon: ${addon}`);
                }

                client.addons.set(addon, addonModule);
                client.logger.success(`Loaded addon: ${addon}`);
            } catch (error) {
                client.logger.error(`Failed to load addon ${addon}: ${error.stack}`);
            }
        } else {
            console.error(`index.js not found for addon: ${addon}`);
        }
    }
};
