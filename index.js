require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/*
  the following boilerplate was provided to you by our friends over at discordjs.guide
  https://discordjs.guide/creating-your-bot/command-handling.html#loading-command-files
*/

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log("Ready!");
  client.user.setActivity("over Amber's home", { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// If storage doesn't exist, create it
if (!fs.existsSync("storage")) {
  fs.mkdirSync("storage");
}

// If rooms.json doesn't exist, create it
if (!fs.existsSync("storage/rooms.json")) {
  fs.writeFileSync("storage/rooms.json", "{}");
}

// do the same for places.json
if (!fs.existsSync("storage/places.json")) {
  fs.writeFileSync("storage/places.json", "{}");
}

client.login(process.env.TOKEN);
