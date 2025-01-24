import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class Ping {
  @Slash({ description: "Check the bot's latency" })
  async ping(interaction: CommandInteraction): Promise<void> {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! Bot latency is ${latency}ms.`);
  }
}
