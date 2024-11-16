// config.js
module.exports = {
    token: "",
    defaultPrefix: "!",
    owners: ["931059762173464597"],
    embedColors: {
        default: "#2f3136",
        error: "#ff0000",
        success: "#00ff00",
        info: "#0000ff"
    },
    emojis: {
        success: "✅",
        error: "❌",
        loading: "⏳"
    },
    database: {
        quickdb: {
            prefixFile: "databases/prefix.sqlite",
            settingsFile: "databases/settings.sqlite",
            userDataFile: "databases/userdata.sqlite"
        }
    },
    logging: {
        commands: true,
        events: true,
        debug: true
    }
};
