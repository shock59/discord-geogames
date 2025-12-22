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

const flags: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("flags")
    .setDescription("Do a flag quiz with others in the server!"),
  execute(interaction) {
    const components = [
      new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# Guess the country flag:")
        )
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(
              "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/960px-Flag_of_Australia_%28converted%29.svg.png"
            )
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel("Australia")
              .setCustomId("6e7147e04cf24f798868833a1c4b9b8b"),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel("France")
              .setCustomId("9e9228f18bc54856c004f09c34935c45"),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel("United Kingdom")
              .setCustomId("193141ed52d94d52e569ae282bc032e4"),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel("United States")
              .setCustomId("25fbf203f5294c17a23f896355081dbd")
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
