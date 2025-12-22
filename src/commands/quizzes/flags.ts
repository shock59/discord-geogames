import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
  TextDisplayBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { multipleRandomFromArray, shuffleArray } from "../../lib/arrays.js";
import countries from "../../countries.js";

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!"),
  execute(interaction) {
    const choices = multipleRandomFromArray(countries, 4, true);
    const correctCountry = choices[0]!;
    const shuffledChoices = shuffleArray(choices);

    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# Guess the country flag:")
        )
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(
              `https://flagcdn.com/h240/${correctCountry.iso}.webp`
            )
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            ...shuffledChoices.map((country) =>
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(country.name)
                .setCustomId(country.iso)
            )
          )
        ),
    ];

    interaction.reply({
      components,
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

export default flags;
