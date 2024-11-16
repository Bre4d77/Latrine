const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandCategories = fs.readdirSync(commandsPath);

    for (const category of commandCategories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(categoryPath, file));
            command.category = category;

            client.commands.set(command.name, command);
            if (command.aliases) {
                command.aliases.forEach(alias => client.aliases.set(alias, command.name));
            }

            client.logger.log(`Loaded command: ${command.name} (${category})`);
        }
    }
};
