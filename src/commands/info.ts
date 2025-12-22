import { CommandInteraction, SlashCommandBuilder } from "discord.js";

const info: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get info about the bot"),
  async execute(interaction: CommandInteraction) {
    interaction.reply("The bot is online");
  },
};

export default info;
