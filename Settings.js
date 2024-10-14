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
    wsIP= "wss://8f81fe8d-7e50-44ac-923c-5c407de08e4d-00-1ow5gxno6ewju.worf.replit.dev"

    constructor() {
        this.initialize(this)
    }
}

export default new Settings()