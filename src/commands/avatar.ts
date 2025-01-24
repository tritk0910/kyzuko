import type { CommandInteraction, User } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class Avatar {
  @Slash({ description: "Get a user's avatar" })
  async avatar(
    @SlashOption({
      description: "The user to get the avatar of",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: User | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
    const targetUser = user ?? interaction.user;
    await interaction.reply(targetUser.displayAvatarURL({ size: 4096 }));
  }
}
