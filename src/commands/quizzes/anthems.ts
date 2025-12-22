import { SlashCommandSubcommandBuilder } from "discord.js";

const anthems: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("anthems")
    .setDescription("Do a national anthem quiz with others in the server!"),
  execute(interaction) {
    interaction.reply("anthems");
  },
};

export default anthems;
