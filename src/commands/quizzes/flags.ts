import { SlashCommandSubcommandBuilder } from "discord.js";
import type { Subcommand } from "../../types.js";

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!"),
  execute(interaction) {
    interaction.reply("flags");
  },
};

export default flags;
