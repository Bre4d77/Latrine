// commands/
module.exports = {
    name: 'reload',
    description: 'Reloads all commands, events, and addons',
    category: 'owner',
    permissions: {
        owner: true
    },
    async execute(client, message, args) {
        const loadingMsg = await message.reply({
            embeds: [
                new client.embed()
                    .setDescription(`${client.config.emojis.loading} Reloading bot modules...`)
                    .setInfoStyle()
            ]
        });

        try {
            await client.reload();

            // Update loading message with success
            await loadingMsg.edit({
                embeds: [
                    new client.embed()
                        .setTitle('Reload Successful')
                        .setDescription(
                            [
                                `${client.config.emojis.success} Successfully reloaded:`,
                                `• ${client.commands.size} commands`,
                                `• ${client.events.size} events`,
                                `• ${client.addons.size} addons`
                            ].join('\n')
                        )
                        .setSuccessStyle()
                ]
            });
        } catch (error) {
            // Update loading message with error
            await loadingMsg.edit({
                embeds: [
                    new client.embed()
                        .setTitle('Reload Failed')
                        .setDescription(`${client.config.emojis.error} An error occurred while reloading:\n\`\`\`js\n${error.message}\`\`\``)
                        .setErrorStyle()
                ]
            });

            // Log the full error
            client.logger.error(`Reload failed: ${error.stack}`);
        }
    }
};
