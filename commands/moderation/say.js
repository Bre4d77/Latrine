module.exports = {
    name: 'say',
    category: 'utility',
    description: 'Repeats the message you provide.',
    aliases: ['repeat'],
    usage: '<message>',
    examples: ['say Hello, world!', 'say This is a test.'],
    permissions: {
        user: [],
        bot: ['SendMessages'],
        owner: false,
        nsfw: false
    },
    args: {
        min: 1,
        max: null,
        required: true
    },
    cooldown: 3,
    async execute(client, message, args) {
        const text = args.join(' ');
        await message.delete().catch(() => {});
        message.channel.send(text);
    }
};
