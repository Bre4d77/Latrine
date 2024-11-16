
const { AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');

module.exports = {
    name: 'welcome',
    description: 'Advanced welcome message system with customizable cards',
    version: '1.0.0',
    author: 'bre4d',

    async init(client) {
        // Register welcome settings in database
        const db = client.db.settings;
        
        // Background images path
        this.backgroundsPath = path.join(__dirname, 'backgrounds');
        
        // Register canvas fonts
        Canvas.registerFont(path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'), { family: 'Roboto' });
        Canvas.registerFont(path.join(__dirname, 'fonts', 'Roboto-Bold.ttf'), { family: 'Roboto Bold' });

        // Cache frequently used assets
        this.cache = {
            backgrounds: new Map(),
            defaultBackground: await Canvas.loadImage(path.join(this.backgroundsPath, 'default.jpg'))
        };

        client.welcome = {
            createCard: this.createWelcomeCard.bind(this),
            getSettings: async (guildId) => {
                return await db.get(`welcome_${guildId}`) || {
                    enabled: false,
                    channel: null,
                    message: 'Welcome {user} to {server}!\nMember #{count}',
                    background: 'default',
                    color: '#ffffff',
                    withImage: true
                };
            }
        };
    },

    async createWelcomeCard(member, settings) {
        const canvas = Canvas.createCanvas(1024, 450);
        const ctx = canvas.getContext('2d');

        // Load background
        let background;
        if (settings.background === 'default' || !settings.background) {
            background = this.cache.defaultBackground;
        } else {
            if (!this.cache.backgrounds.has(settings.background)) {
                try {
                    const img = await Canvas.loadImage(path.join(this.backgroundsPath, `${settings.background}.png`));
                    this.cache.backgrounds.set(settings.background, img);
                    background = img;
                } catch {
                    background = this.cache.defaultBackground;
                }
            } else {
                background = this.cache.backgrounds.get(settings.background);
            }
        }

        // Draw background
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Add overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw user avatar
        const avatar = await Canvas.loadImage(
            member.user.displayAvatarURL({ extension: 'jpg', size: 256 })
        );
        const avatarSize = 200;
        const avatarX = (canvas.width - avatarSize) / 2;
        const avatarY = 50;

        // Avatar circle mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Draw text
        ctx.textAlign = 'center';
        ctx.fillStyle = settings.color || '#ffffff';

        // Welcome text
        ctx.font = '50px "Roboto Bold"';
        ctx.fillText('WELCOME', canvas.width / 2, avatarY + avatarSize + 60);

        // Username
        ctx.font = '40px "Roboto"';
        ctx.fillText(member.user.tag, canvas.width / 2, avatarY + avatarSize + 120);

        // Member count
        ctx.font = '30px "Roboto"';
        ctx.fillText(
            `Member #${member.guild.memberCount}`,
            canvas.width / 2,
            avatarY + avatarSize + 170
        );

        return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.jpg' });
    }
};
