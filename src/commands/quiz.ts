import { SlashCommandBuilder } from "discord.js";
import flags from "./quizzes/flags.js";
import anthems from "./quizzes/anthems.js";

const subcommands = [flags, anthems];

const quiz: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription(".")
    .addSubcommand(flags.data)
    .addSubcommand(anthems.data),
  async execute(interaction) {
    const option = interaction.options.getSubcommand();
    const subcommand = subcommands.find(
      (subcommand) => subcommand.data.name == option
    );
    if (!subcommand) {
      await interaction.reply("Error: invalid command");
      return;
    }
    subcommand.execute(interaction);
  },
};

export default quiz;
