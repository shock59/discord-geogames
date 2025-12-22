import type {
  RESTPostAPIApplicationCommandsJSONBody,
  CommandInteraction,
} from "discord.js";

type SlashCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => void;
};
type Subcommand = {
  data: SlashCommandSubcommandBuilder;
  execute: (interaction: CommandInteraction) => void;
};
