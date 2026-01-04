import {
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { multipleRandomFromArray } from "../../lib/arrays.js";
import countries from "../../countries.js";
import quiz from "../../lib/quiz.js";

const capitals: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("capitals")
    .setDescription("Do a capital city quiz with others in the server!")
    .addIntegerOption(
      new SlashCommandIntegerOption()
        .setName("time")
        .setDescription("The amount of time available to answer the quiz.")
        .setRequired(false)
    )
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName("reverse")
        .setDescription(
          "Guess the country of the given capital city, instead of vice versa"
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const validCapitals = countries.filter(
      (country) => country.capital && !country.capital.obvious
    );
    quiz(
      interaction,
      () =>
        multipleRandomFromArray(validCapitals, 4, true).map((country) => ({
          id: country.iso,
          displayName: country.capital!.name,
          answerDisplayName: `:flag_${country.iso}: ${country.capital!.name}, ${
            country.name
          }`,
          questionText: `What is the capital of :flag_${country.iso}: **${country.name}**?`,
        })),
      "text",
      "Guess the capital city",
      true,
      15
    );
  },
};

export default capitals;
