import type {
  RESTPostAPIApplicationCommandsJSONBody,
  CommandInteraction,
} from "discord.js";

type SlashCommand = {
  data: JSONEncodable<RESTPostAPIApplicationCommandsJSONBody>;
  execute: (interaction: CommandInteraction) => void;
};
