const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventCategories = fs.readdirSync(eventsPath);
    
    // 
    const loadedEvents = [];
    let totalEvents = 0;

    for (const category of eventCategories) {
        const categoryPath = path.join(eventsPath, category);
        
        if (!fs.statSync(categoryPath).isDirectory()) continue;
        
        const eventFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        let categoryEventCount = 0;

        for (const file of eventFiles) {
            // Clear require cache if reloading
            delete require.cache[require.resolve(path.join(categoryPath, file))];
            
            const event = require(path.join(categoryPath, file));
            const eventName = file.split('.')[0];

            // Remove existing listeners if reloading
            if (client.registeredEvents?.has(eventName)) {
                client.removeAllListeners(eventName);
            }

            // Register the event
            if (event.once) {
                client.once(eventName, (...args) => event.execute(client, ...args));
            } else {
                client.on(eventName, (...args) => event.execute(client, ...args));
            }

            // Track registered events
            if (!client.registeredEvents) client.registeredEvents = new Set();
            client.registeredEvents.add(eventName);

            client.events.set(eventName, event);
            categoryEventCount++;
            totalEvents++;

            // Store event data for the table
            loadedEvents.push({
                name: eventName,
                category: category,
                type: event.once ? 'once' : 'on'
            });
        }

        // Log category summary
        if (categoryEventCount > 0) {
            client.logger.log(`Loaded ${categoryEventCount} events from ${category}`);
        }
    }

    console.log('\nEvents Loaded:');
    console.table(loadedEvents.reduce((acc, event) => {
        acc[event.name] = {
            Category: event.category,
            Type: event.type
        };
        return acc;
    }, {}));

    // Log total
    client.logger.success(`Total events loaded: ${totalEvents}`);
};