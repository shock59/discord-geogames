import {
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { multipleRandomFromArray } from "../../lib/arrays.js";
import countries from "../../countries.js";
import quiz from "../../lib/quiz.js";

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!")
    .addIntegerOption(
      new SlashCommandIntegerOption()
        .setName("time")
        .setDescription("The amount of time available to answer the quiz.")
        .setRequired(false)
    ),
  execute: (interaction) => {
    quiz(
      interaction,
      () =>
        multipleRandomFromArray(countries, 4, true).map((country) => ({
          id: country.iso,
          displayName: country.name,
          imageUrl: flagUrl(country.iso),
          attribution:
            "Flag images sourced from [Flagpedia.net](https://flagpedia.net)",
        })),
      "image",
      "Guess the country flag"
    );
  },
};

function flagUrl(iso: string) {
  return `https://flagcdn.com/h240/${iso}.webp`;
}

export default flags;
