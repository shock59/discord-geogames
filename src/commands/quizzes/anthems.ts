import {
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { multipleRandomFromArray } from "../../lib/arrays.js";
import countries from "../../countries.js";
import quiz from "../../lib/quiz.js";

const anthems: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("anthems")
    .setDescription("Do a national anthem quiz with others in the server!")
    .addIntegerOption(
      new SlashCommandIntegerOption()
        .setName("time")
        .setDescription("The amount of time available to answer the quiz.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const validCountries = countries.filter(
      (country) => country.anthem?.audio.instrumental
    );
    quiz(
      interaction,
      () =>
        multipleRandomFromArray(validCountries, 4, true).map((country) => ({
          id: country.iso,
          displayName: country.name,
          answerDisplayName: `:flag_${country.iso}: ${country.name}\n**${
            country.anthem!.name
          }**${
            country.anthem!.translatedName
              ? ` ("${country.anthem?.translatedName}")`
              : ""
          }`,
          imageUrl: country.anthem!.audio.instrumental!.src,
          attribution: `Audio from ${
            country.anthem!.audio.instrumental!.attribution
          }`,
        })),
      "video",
      "Guess the national anthem",
      true,
      30
    );
  },
};

export default anthems;
