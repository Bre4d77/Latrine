
module.exports = {
    name: 'welcome',
    description: 'Configure the welcome system',
    category: 'config',
    permissions: {
        user: ['ManageGuild'],
        bot: ['SendMessages', 'AttachFiles']
    },
    usage: '<enable/disable/channel/message/background/color/preview/test>',
    examples: [
        'welcome enable',
        'welcome disable',
        'welcome channel #welcome',
        'welcome message Welcome {user} to {server}!',
        'welcome background default',
        'welcome color #ff0000',
        'welcome preview',
        'welcome test'
    ],
    async execute(client, message, args) {
        if (!args.length) {
            return message.reply({
                embeds: [
                    new client.embed()
                        .setTitle('Welcome System Configuration')
                        .setDescription('Use the following subcommands to configure the welcome system:')
                        .addFields(
                            { name: '📡 enable/disable', value: 'Enable or disable the welcome system' },
                            { name: '📺 channel', value: 'Set the welcome channel' },
                            { name: '✏️ message', value: 'Set the welcome message\nVariables: {user}, {server}, {count}, {user.tag}, {user.name}, {user.id}' },
                            { name: '🖼️ background', value: 'Set the welcome card background' },
                            { name: '🎨 color', value: 'Set the welcome card text color' },
                            { name: '👁️ preview', value: 'Preview the current welcome message' },
                            { name: '🔄 test', value: 'Test the welcome system' }
                        )
                        .setInfoStyle()
                ]
            });
        }

        const settings = await client.welcome.getSettings(message.guild.id);
        const subcommand = args[0].toLowerCase();

        switch (subcommand) {
            case 'enable':
                settings.enabled = true;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription('✅ Welcome system has been enabled!')
                            .setSuccessStyle()
                    ]
                });

            case 'disable':
                settings.enabled = false;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription('✅ Welcome system has been disabled!')
                            .setSuccessStyle()
                    ]
                });

            case 'channel':
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                if (!channel) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Please mention a valid channel!')
                                .setErrorStyle()
                        ]
                    });
                }
                settings.channel = channel.id;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription(`✅ Welcome channel has been set to ${channel}!`)
                            .setSuccessStyle()
                    ]
                });

            case 'message':
                const newMessage = args.slice(1).join(' ');
                if (!newMessage) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Please provide a welcome message!')
                                .setErrorStyle()
                        ]
                    });
                }
                settings.message = newMessage;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription('✅ Welcome message has been updated!')
                            .addFields({ name: 'New Message', value: newMessage })
                            .setSuccessStyle()
                    ]
                });

            case 'background':
                const background = args[1]?.toLowerCase();
                if (!background) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Please provide a background name!')
                                .setErrorStyle()
                        ]
                    });
                }
                settings.background = background;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription(`✅ Welcome card background has been set to \`${background}\`!`)
                            .setSuccessStyle()
                    ]
                });

            case 'color':
                const color = args[1];
                if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Please provide a valid hex color code (e.g., #FF0000)!')
                                .setErrorStyle()
                        ]
                    });
                }
                settings.color = color;
                await client.db.settings.set(`welcome_${message.guild.id}`, settings);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription(`✅ Welcome card text color has been set to \`${color}\`!`)
                            .setColor(color)
                            .setSuccessStyle()
                    ]
                });

            case 'preview':
                const previewCard = await client.welcome.createCard(message.member, settings);
                const previewMessage = settings.message
                    .replace(/{user}/g, message.member)
                    .replace(/{server}/g, message.guild.name)
                    .replace(/{count}/g, message.guild.memberCount)
                    .replace(/{user.tag}/g, message.author.tag)
                    .replace(/{user.name}/g, message.author.username)
                    .replace(/{user.id}/g, message.author.id);

                return message.reply({
                    content: previewMessage,
                    files: [previewCard]
                });

            case 'test':
                if (!settings.enabled) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Welcome system is currently disabled!')
                                .setErrorStyle()
                        ]
                    });
                }
                if (!settings.channel) {
                    return message.reply({
                        embeds: [
                            new client.embed()
                                .setDescription('❌ Welcome channel has not been set!')
                                .setErrorStyle()
                        ]
                    });
                }
                // Trigger the welcome event manually
                client.emit('guildMemberAdd', message.member);
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription('✅ Test welcome message has been sent!')
                            .setSuccessStyle()
                    ]
                });

            default:
                return message.reply({
                    embeds: [
                        new client.embed()
                            .setDescription('❌ Invalid subcommand! Use `welcome` to see all available options.')
                            .setErrorStyle()
                    ]
                });
        }
    }
};
