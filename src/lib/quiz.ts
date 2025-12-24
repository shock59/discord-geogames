import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  User,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { shuffleArray } from "./arrays.js";

type QuestionType = "image";
type Choice = {
  id: string;
  displayName: string;
  imageUrl?: string;
  attribution?: string;
};

let sessions: string[] = [];

export default async function quiz(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  getChoices: () => Choice[],
  questionType: QuestionType,
  prompt: string,
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

  const choices = getChoices();
  const correctChoice = choices[0]!;
  const shuffledChoices = shuffleArray(choices);

  const container = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${prompt}`)
  );
  if (questionType == "image") {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(correctChoice.imageUrl ?? "")
      )
    );
  }

  container
    .addActionRowComponents(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        ...shuffledChoices.map((choice) =>
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(choice.displayName)
            .setCustomId(choice.id)
        )
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ending <t:${Math.floor(Date.now() / 1000) + time}:R>`
      )
    );

  if (correctChoice.attribution) {
    container
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${correctChoice.attribution}`)
      );
  }

  const response = await interaction.reply({
    components: [container],
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

    const selected = choices.find(
      (choice) => choice.id == interaction.customId
    );
    await interaction.reply({
      content: `You selected **${selected?.displayName}**!`,
      flags: MessageFlags.Ephemeral,
    });
  });

  collector.on("end", async () => {
    const container = resultsContainer(
      questionType,
      correctChoice,
      shuffledChoices,
      responses,
      false
    );
    const response = await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });

    sessions.splice(sessions.indexOf(interaction.channelId), 1);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15_000,
    });

    collector.on("collect", async (newInteraction) => {
      const container = resultsContainer(
        questionType,
        correctChoice,
        shuffledChoices,
        responses,
        true
      );
      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
      await quiz(newInteraction, getChoices, questionType, prompt, time);
    });

    collector.on("end", async () => {
      const container = resultsContainer(
        questionType,
        correctChoice,
        shuffledChoices,
        responses,
        true
      );
      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    });
  });
}

function resultsContainer(
  questionType: QuestionType,
  correctChoice: Choice,
  shuffledChoices: Choice[],
  responses: {
    user: User;
    choice: string;
  }[],
  disablePlayAgain: boolean
) {
  const section = new SectionBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`The correct answer was`),
    new TextDisplayBuilder().setContent(`### ${correctChoice.displayName}`)
  );
  if (questionType == "image") {
    section.setThumbnailAccessory(
      new ThumbnailBuilder().setURL(correctChoice.imageUrl ?? "")
    );
  }

  const container = new ContainerBuilder()
    .addSectionComponents(section)
    .addActionRowComponents(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        ...shuffledChoices.map((choice) => {
          const correct = choice.id == correctChoice.id;

          return new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(choice.displayName)
            .setCustomId(choice.id)
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
                const correct = response.choice == correctChoice.id;
                const selected = shuffledChoices.find(
                  (choice) => choice.id == response.choice
                );

                return `:${
                  correct ? "white_check_mark" : "x"
                }: ${response.user.toString()} answered **${
                  selected?.displayName
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
    );

  if (correctChoice.attribution) {
    container
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "-# Flags sourced from [Flagpedia.net](https://flagpedia.net)"
        )
      );
  }

  return container;
}
