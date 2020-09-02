import { ACCENT_COLOR, CATEGORIES, DORMANT_CHANNEL_TIMEOUT } from "./config";
import { MessageEmbed } from "discord.js";

export const AVAILABLE_EMBED = new MessageEmbed()
  .setColor(ACCENT_COLOR)
  .setTitle("AVAILABLE CHANNEL")
  .setDescription(
    "This help channel is now **available**, which means that " +
      "you can claim it by typing your question into it. " +
      `Once claimed, the channel will move into the **${CATEGORIES.ongoing}** category, and ` +
      `will be yours until it has been inactive for ${
        DORMANT_CHANNEL_TIMEOUT / 60 / 60
      } hours or is closed ` +
      `manually with \`!close\`. When that happens, it will be set to **dormant** and moved into the **${CATEGORIES.dormant}** category.\n\n` +
      "Try to write the best question you can by providing a detailed description and telling us what you've tried already."
  );

export const DORMANT_EMBED = new MessageEmbed()
  .setColor(ACCENT_COLOR)
  .setTitle("DORMANT ISSUE")
  .setDescription(
    `This help channel has been marked as **dormant**, and has been moved into the **${CATEGORIES.dormant}** category at the ` +
      "bottom of the channel list. It is no longer possible to send messages in this channel until it becomes available again.\n\n" +
      `If your question wasn't answered yet, you can claim a new help channel from the **${CATEGORIES.ask}** category` +
      " by simply asking your question again. Consider rephrasing the question to maximize your chance of getting " +
      "a good answer. If you're not sure how, have a look through " +
      "[StackOverflow's guide on asking a good question](https://stackoverflow.com/help/how-to-ask)"
  );
