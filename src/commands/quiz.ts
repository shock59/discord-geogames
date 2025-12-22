import { SlashCommandBuilder } from "discord.js";
import flags from "./quizzes/flags.js";

const subcommands = [flags];

const quiz: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription(".")
    .addSubcommand(flags.data),
  async execute(interaction) {
    const option = interaction.command?.options[0];
    if (option?.type != 1) {
      await interaction.reply("Error: invalid command");
      return;
    }
    const subcommand = subcommands.find(
      (subcommand) => subcommand.data.name == option.name
    );
    if (!subcommand) {
      await interaction.reply("Error: invalid command");
      return;
    }
    subcommand.execute(interaction);
  },
};

export default quiz;
