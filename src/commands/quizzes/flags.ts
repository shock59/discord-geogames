import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SlashCommandSubcommandBuilder,
  TextDisplayBuilder,
  User,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { multipleRandomFromArray, shuffleArray } from "../../lib/arrays.js";
import countries from "../../countries.js";

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!"),
  async execute(interaction) {
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
        time: 15_000,
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
        content: `You guessed **${chosenCountry?.name}**!`,
        flags: MessageFlags.Ephemeral,
      });
    });

    collector.on("end", async () => {
      const components = [
        new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `The correct answer was **${correctCountry.name}**\n\n${responses
              .map((response) => {
                const correct = response.choice == correctCountry.iso;
                const chosenCountry = choices.find(
                  (country) => country.iso == response.choice
                );

                return `:${
                  correct ? "white_check_mark" : "x"
                }: ${response.user.toString()} selected **${
                  chosenCountry?.name
                }**`;
              })
              .join("\n")}`
          )
        ),
      ];

      await interaction.editReply({
        components,
        flags: MessageFlags.IsComponentsV2,
      });
    });
  },
};

export default flags;
