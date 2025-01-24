import type { CommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { getAudioUrl } from "google-tts-api";
import { Readable } from "stream";

@Discord()
export class Speak {
  @Slash({ description: "Speak a text in a voice channel" })
  async speak(
    @SlashOption({
      description: "The text to speak",
      name: "content",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    content: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply(
        "You need to be in a voice channel to use this command."
      );
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, async () => {
      const audioPlayer = createAudioPlayer();
      connection.subscribe(audioPlayer);

      content = content.trim();
      if (content.length > 200) {
        return await interaction.reply(
          "The text is too long. Please limit it to 200 characters."
        );
      }

      const url = getAudioUrl(content, {
        lang: "vi",
        slow: false,
        host: "https://translate.google.com",
      });

      const response = await fetch(url);
      const body = response.body;
      if (!body) {
        await interaction.reply("Failed to fetch audio stream.");
        connection.destroy();
        return;
      }
      const reader = body.getReader();
      const stream = new Readable({
        async read() {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            this.push(value);
          }
          this.push(null);
        },
      });
      const audioStream = stream;
      const resource = createAudioResource(audioStream);

      audioPlayer.play(resource);
      audioPlayer.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      const embed = new EmbedBuilder()
        .setColor("#44e0dd")
        .setDescription(`${interaction.user} said: "${content}"`);

      await interaction.reply({ embeds: [embed] });
    });
  }
}
