import { Client, Events, GatewayIntentBits } from "discord.js";
import info from "./commands/info.js";
import quiz from "./commands/quiz.js";

const commands = [info, quiz];
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
  await readyClient.application.commands.set(
    commands.map((command) => command.data)
  );

  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.find(
      (command) => command.data.name == interaction.command?.name
    );
    if (!command) {
      await interaction.reply("Error: invalid command");
      return;
    }

    command.execute(interaction);
  }
});

client.login(process.env.BOT_TOKEN);
