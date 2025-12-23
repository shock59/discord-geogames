import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SlashCommandSubcommandBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  User,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { multipleRandomFromArray, shuffleArray } from "../../lib/arrays.js";
import countries from "../../countries.js";

function flagUrl(iso: string) {
  return `https://flagcdn.com/h240/${iso}.webp`;
}

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!"),
  async execute(interaction) {
    const time = 15;

    const choices = multipleRandomFromArray(countries, 4, true);
    const correctCountry = choices[0]!;
    const shuffledChoices = shuffleArray(choices);

    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("## Guess the country flag:")
        )
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(flagUrl(correctCountry.iso))
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
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Ending <t:${Math.floor(Date.now() / 1000) + time}:R>`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "-# Flag images sourced from [Flagpedia.net](https://flagpedia.net)"
          )
        ),
    ];

    const response = await interaction.reply({
      components,
      flags: MessageFlags.IsComponentsV2,
      withResponse: true,
    });

    if (!response.resource?.message) return;

    let responses: {
      user: User;
      choice: string;
    }[] = [];

    const collector = response.resource.message.createMessageComponentCollector(
      {
        componentType: ComponentType.Button,
        time: time * 1000,
      }
    );

    collector.on("collect", async (interaction) => {
      if (
        responses.some((response) => response.user.id == interaction.user.id)
      ) {
        await interaction.reply({
          content: "You already guessed!",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      responses.push({
        user: interaction.user,
        choice: interaction.customId,
      });

      const chosenCountry = choices.find(
        (country) => country.iso == interaction.customId
      );
      await interaction.reply({
        content: `You selected **${chosenCountry?.name}**!`,
        flags: MessageFlags.Ephemeral,
      });
    });

    collector.on("end", async () => {
      const components = [
        new ContainerBuilder()
          .addSectionComponents(
            new SectionBuilder()
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(flagUrl(correctCountry.iso))
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`The correct answer was`),
                new TextDisplayBuilder().setContent(
                  `### ${correctCountry.name}`
                )
              )
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              responses.length
                ? `${responses
                    .map((response) => {
                      const correct = response.choice == correctCountry.iso;
                      const chosenCountry = choices.find(
                        (country) => country.iso == response.choice
                      );

                      return `:${
                        correct ? "white_check_mark" : "x"
                      }: ${response.user.toString()} answered **${
                        chosenCountry?.name
                      }**`;
                    })
                    .join("\n")}`
                : "Nobody chose an answer."
            )
          )
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "-# Flags sourced from [Flagpedia.net](https://flagpedia.net)"
            )
          ),
      ];

      await interaction.editReply({
        components,
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    });
  },
};

export default flags;
