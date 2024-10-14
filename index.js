// Most of the code is used from the IRC from fork!

import WebSocket from "WebSocket"
import Settings from "./Settings.js"
const ws = new WebSocket(Settings.wsIP);

// Auth
const serverId = java.util.UUID.randomUUID().toString().replace("-", "")
Client.getMinecraft().func_152347_ac().joinServer(Client.getMinecraft().func_110432_I().func_148256_e(), Client.getMinecraft().func_110432_I().func_148254_d(), serverId)

ws.onOpen = () => ws.send(JSON.stringify({ method: "login", username: Player.getName(), key: serverId }))

ws.onMessage = message => {
    console.log('Message received from server:', message); // Log incoming messages
    const json = JSON.parse(message.toString());

    if (json.success) {
        ChatLib.chat("§8[§9IRC§8] §2Logged in successfully!");
        reconnected = false;
    } else if (json.method === "message") {
        // Processing incoming messages
        let recipient = json.recipients === "everyone" ? "§aEveryone" : json.recipients.length ? `§a${json.recipients.map(name => name[0].toUpperCase() + name.slice(1)).join("§8, §a")}` : "§eError";
        let colorCode = recipient === "§eError" ? "§m" : "§r";
        let prefix = recipient === "§aEveryone" ? `§8[§9IRC§8] ` : json.recipients.length === 1 ? `§8[§5DM§8] ` : `§8[§aGROUP§8] `;

        let textComponents = [];
        textComponents.push(new TextComponent(prefix), new TextComponent(`§b${json.username ?? "Unknown User"}`).setHoverValue(recipient), new TextComponent(" §8> "));

        json.message.split(" ").forEach((chunk, index, original) => {
            if (chunk.startsWith("https")) {
                textComponents.push(new TextComponent(`${colorCode}${chunk}`).setClick("open_url", chunk), new TextComponent(index === original.length - 1 ? "" : " "));
            } else {
                textComponents.push(new TextComponent(`${colorCode}${chunk}` + (index === original.length - 1 ? "" : " ")));
            }
        });
        new Message(textComponents).chat();

        if (recipient === "§eError") ChatLib.chat("§8[§9IRC§8] §cThe message above did not send! Please check your recipients are valid!");
    } else if (json.method === "online") {
        ChatLib.chat(`§8[§9IRC§8] §aOnline (§6${json.users.length}§a)§8: §b${json.users.map(user => "§b" + user).join("§8, ")}`);
    } else if (json.method === "heartbeat") {
        ws.send(JSON.stringify({ method: "heartbeat" }));
    } else if(json.success == false){
        ChatLib.chat(`§8[§9IRC§8] §cAn error occured: ${json.error}`);
    }
};

let reconnected = false
ws.onClose = () => {
    if (!Settings.toggled || unloaded) return

    if (!reconnected) ChatLib.chat("§8[§9IRC§8] §cAn error occured with the socket! Attempting reconnect in 5s!")
    else return ChatLib.chat("§8[§9IRC§8] §cReconnect failed! Try /ct reload!")

    reconnected = true
    setTimeout(() => ws.reconnect(), 5000)
}

ws.connect()

let unloaded = false
register("gameUnload", () => {
    unloaded = true
    ws.close()
})

// Game stuff
Settings.registerListener("Toggle IRC", () => {
    if (Settings.toggled) {
        ChatLib.chat("§8[§9IRC§8] §cDisconnected from IRC!")
        ws.close()
    } else ws.reconnect()
})

register("messageSent", (message, event) => {
    if (!message.startsWith("#") || !Settings.toggled) return
    cancel(event)

    // Only mildly intelligent line of code in the entire module
    if (message.startsWith("##")) {
        const recipient = message.match(/##([\w]+)/)?.[1]?.toLowerCase()
        if (!recipient) ChatLib.chat("§8[§9IRC§8] §cUnable to parse username!")

        return ws.send(JSON.stringify({ method: "message", message: message.replace(`${message.split(" ")[0]} `, ""), recipients: [ recipient ] }))
    }

    ws.send(JSON.stringify({ method: "message", message: message.replace("#", ""), recipients: "everyone" }))
})

// Open chat with a hash when you press hash (Not sure why it's called apostrophe)
new KeyBind("Open IRC", Keyboard.KEY_APOSTROPHE, "[IRC]").registerKeyPress(() => Client.setCurrentChatMessage("#"))

register("command", (...args) => {
    if (args[0] != "online") return Settings.openGUI()
    
    ws.send(JSON.stringify({ method: "online" }))
}).setName("irc").setTabCompletions(["online"])