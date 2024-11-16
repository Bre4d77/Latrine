
module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        const settings = await client.welcome.getSettings(member.guild.id);
        if (!settings.enabled || !settings.channel) return;

        const channel = member.guild.channels.cache.get(settings.channel);
        if (!channel) return;

        try {
            // Parse welcome message
            const message = settings.message
                .replace(/{user}/g, member)
                .replace(/{server}/g, member.guild.name)
                .replace(/{count}/g, member.guild.memberCount)
                .replace(/{user.tag}/g, member.user.tag)
                .replace(/{user.name}/g, member.user.username)
                .replace(/{user.id}/g, member.user.id);

            const payload = { content: message };

            // Create welcome card if enabled
            if (settings.withImage) {
                const card = await client.welcome.createCard(member, settings);
                payload.files = [card];
            }

            await channel.send(payload);
        } catch (error) {
            client.logger.error(`Welcome message failed for ${member.user.tag} in ${member.guild.name}: ${error}`);
        }
    }
};
