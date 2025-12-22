type SlashCommand = {
  data:
    | import("discord.js").SlashCommandBuilder
    | import("discord.js").SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: import("discord.js").CommandInteraction) => void;
};
type Subcommand = {
  data: import("discord.js").SlashCommandSubcommandBuilder;
  execute: (interaction: import("discord.js").CommandInteraction) => void;
};
