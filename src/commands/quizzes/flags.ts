import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collector,
  ComponentType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SlashCommandIntegerOption,
  SlashCommandSubcommandBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  User,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { multipleRandomFromArray, shuffleArray } from "../../lib/arrays.js";
import countries from "../../countries.js";

let sessions: string[] = [];

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
  execute,
};

function flagUrl(iso: string) {
  return `https://flagcdn.com/h240/${iso}.webp`;
}

async function execute(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  time: number = 15
) {
  if (sessions.includes(interaction.channelId)) {
    await interaction.reply({
      content: "A quiz is already running in this channel!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  sessions.push(interaction.channelId);

  if (interaction.isChatInputCommand()) {
    time = interaction.options.getInteger("time", false) ?? time;
  }

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
      .addSeparatorComponents(new SeparatorBuilder())
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

  const collector = response.resource.message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: time * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (responses.some((response) => response.user.id == interaction.user.id)) {
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
    const components = resultsComponents(
      correctCountry,
      shuffledChoices,
      responses,
      false
    );
    const response = await interaction.editReply({
      components,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });

    sessions.splice(sessions.indexOf(interaction.channelId), 1);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15_000,
    });

    collector.on("collect", async (newInteraction) => {
      const components = resultsComponents(
        correctCountry,
        shuffledChoices,
        responses,
        true
      );
      await interaction.editReply({
        components,
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
      await execute(newInteraction, time);
    });

    collector.on("end", async () => {
      const components = resultsComponents(
        correctCountry,
        shuffledChoices,
        responses,
        true
      );
      await interaction.editReply({
        components,
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    });
  });
}

function resultsComponents(
  correctCountry: Country,
  shuffledChoices: Country[],
  responses: {
    user: User;
    choice: string;
  }[],
  disablePlayAgain: boolean
) {
  return [
    new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(flagUrl(correctCountry.iso))
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`The correct answer was`),
            new TextDisplayBuilder().setContent(`### ${correctCountry.name}`)
          )
      )
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          ...shuffledChoices.map((country) => {
            const correct = country.iso == correctCountry.iso;

            return new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(country.name)
              .setCustomId(country.iso)
              .setEmoji({ name: correct ? "✅" : "❌" })
              .setDisabled(true);
          })
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          responses.length
            ? `${responses
                .map((response) => {
                  const correct = response.choice == correctCountry.iso;
                  const chosenCountry = shuffledChoices.find(
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
      .addSeparatorComponents(new SeparatorBuilder().setDivider(false))
      .addActionRowComponents(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Play again")
            .setCustomId("playAgain")
            .setDisabled(disablePlayAgain)
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "-# Flags sourced from [Flagpedia.net](https://flagpedia.net)"
        )
      ),
  ];
}

export default flags;
