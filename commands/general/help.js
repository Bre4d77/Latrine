// commands/
const { StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Shows all available commands',
    aliases: ['h', 'commands'],
    usage: '[command/category]',
    examples: ['help', 'help ping', 'help moderation'],
    cooldown: 3,
    async execute(client, message, args) {
        const prefix = await client.getPrefix(message);
        const { commands, addons } = client;

        // If a specific command is requested
        if (args.length) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.get(client.aliases.get(commandName));

            if (command) {
                const embed = new client.embed()
                    .setTitle(`Command: ${command.name}`)
                    .setDescription(command.description || 'No description provided')
                    .setInfoStyle()
                    .addFields(
                        { 
                            name: 'Usage', 
                            value: `\`${prefix}${command.name} ${command.usage || ''}\``,
                            inline: true 
                        },
                        { 
                            name: 'Category', 
                            value: command.category,
                            inline: true 
                        },
                        { 
                            name: 'Cooldown', 
                            value: `${command.cooldown || 0} seconds`,
                            inline: true 
                        }
                    );

                if (command.aliases?.length) {
                    embed.addFields({
                        name: 'Aliases',
                        value: command.aliases.map(alias => `\`${alias}\``).join(', ')
                    });
                }

                if (command.examples?.length) {
                    embed.addFields({
                        name: 'Examples',
                        value: command.examples.map(example => `\`${prefix}${example}\``).join('\n')
                    });
                }

                if (command.permissions) {
                    const perms = [];
                    if (command.permissions.user) perms.push(`User: ${command.permissions.user.join(', ')}`);
                    if (command.permissions.bot) perms.push(`Bot: ${command.permissions.bot.join(', ')}`);
                    if (command.permissions.owner) perms.push('Owner Only');
                    if (command.permissions.nsfw) perms.push('NSFW Channel Only');

                    embed.addFields({
                        name: 'Required Permissions',
                        value: perms.join('\n')
                    });
                }

                if (command.addon) {
                    embed.addFields({
                        name: 'Addon',
                        value: `This command is part of the \`${command.addon}\` addon`
                    });
                }

                return message.reply({ embeds: [embed] });
            }
        }

        // Create category map including both regular commands and addon commands
        const categories = new Map();
        
        // Add regular commands to categories
        commands.forEach(cmd => {
            if (!cmd.hidden) {
                const category = cmd.category || 'Uncategorized';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push(cmd);
            }
        });

        // Create help menu components
        const selectMenu = client.menu.simple(
            'help_category',
            '📚 Select a category',
            Array.from(categories.keys()).map(category => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(category.charAt(0).toUpperCase() + category.slice(1))
                    .setDescription(`View ${category} commands`)
                    .setValue(category)
                    .setEmoji(getCategoryEmoji(category))
            )
        );

        // Add addon category if there are any addons
        if (addons.size) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Addons')
                    .setDescription('View installed addon commands')
                    .setValue('addons')
                    .setEmoji('🔌')
            );
        }

        const mainEmbed = new client.embed()
            .setTitle('📚 Help Menu')
            .setDescription(`Use \`${prefix}help [command]\` for detailed information about a command.`)
            .addFields(
                { 
                    name: 'Categories', 
                    value: Array.from(categories.keys())
                        .map(cat => `${getCategoryEmoji(cat)} ${cat}`)
                        .join('\n') 
                }
            )
            .setInfoStyle();

        if (addons.size) {
            mainEmbed.addFields({
                name: '🔌 Installed Addons',
                value: Array.from(addons.keys()).map(addon => `\`${addon}\``).join(', ')
            });
        }

        const row = client.row.from(selectMenu);
        const response = await message.reply({ 
            embeds: [mainEmbed],
            components: [row]
        });

        // Create collector for menu interactions
        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async interaction => {
            const category = interaction.values[0];
            let categoryEmbed;

            if (category === 'addons') {
                categoryEmbed = new client.embed()
                    .setTitle('🔌 Addon Commands')
                    .setDescription('List of commands from installed addons')
                    .setInfoStyle();

                addons.forEach((addon, name) => {
                    const addonCommands = commands.filter(cmd => cmd.addon === name);
                    if (addonCommands.size) {
                        categoryEmbed.addFields({
                            name: `${name} (${addonCommands.size} commands)`,
                            value: addonCommands.map(cmd => `\`${cmd.name}\``).join(', ')
                        });
                    }
                });
            } else {
                const categoryCommands = categories.get(category);
                categoryEmbed = new client.embed()
                    .setTitle(`${getCategoryEmoji(category)} ${category} Commands`)
                    .setDescription(categoryCommands.map(cmd => 
                        `\`${cmd.name}\` - ${cmd.description || 'No description'}`
                    ).join('\n'))
                    .setInfoStyle();
            }

            await interaction.update({ embeds: [categoryEmbed], components: [row] });
        });

        collector.on('end', () => {
            const disabledRow = client.row.from(
                selectMenu.setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};

// Helper function to get category emoji
function getCategoryEmoji(category) {
    const emojiMap = {
        general: '📋',
        moderation: '🛡️',
        fun: '🎮',
        utility: '🔧',
        music: '🎵',
        economy: '💰',
        leveling: '📊',
        admin: '⚡',
        owner: '👑',
        addons: '🔌'
    };
    return emojiMap[category.toLowerCase()] || '📁';
}
