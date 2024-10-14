import { @Vigilant, @SwitchProperty, @ParagraphProperty } from "Vigilance"

@Vigilant("IRC")
class Settings {
    @SwitchProperty({
        name: "Toggle IRC",
        description: "Toggles connection to IRC.",
        category: "IRC"
    })
    toggled = true

    @ParagraphProperty({
        name: "IRC Server",
        description: "Ip for IRC server. (GitHub for self-hosting the server coming soon.)",
        category: "IRC"
    })
    wsIP= "wss://irc-minecraft-server.onrender.com"

    constructor() {
        this.initialize(this)
    }
}

export default new Settings()