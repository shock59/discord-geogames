type SlashCommand = {
  data:
    | import("discord.js").SlashCommandBuilder
    | import("discord.js").SlashCommandSubcommandsOnlyBuilder;
  execute: (
    interaction: import("discord.js").ChatInputCommandInteraction
  ) => void;
};
type Subcommand = {
  data: import("discord.js").SlashCommandSubcommandBuilder;
  execute: (
    interaction: import("discord.js").ChatInputCommandInteraction
  ) => void;
};
type AnthemAudio = {
  src: string;
  attribution: string;
};
type Country = {
  name: string;
  iso: string;
  anthem?: {
    name: string;
    translatedName?: string;
    audio: {
      instrumental?: AnthemAudio;
    };
  };
};
