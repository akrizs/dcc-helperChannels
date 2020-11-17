/**
 * HELP CHANNEL MODULE
 * SOURCE: typescript-community/community-bot
 * BASEURL: https://github.com/typescript-community/community-bot
 * ORIGINALFILE: https://github.com/typescript-community/community-bot/blob/master/src/modules/helpchan.ts
 *
 * Thanks for the wonderful community that is the Discord TS community for
 * publishing/sharing such and amazing package with great functions.
 *
 * The module is not published as an NPM package and therefore it was copied
 * and modified to my style of writing code.
 *
 * at the moment of development the current contributors are:
 * robertt: <https://github.com/robertt>
 * ronthecookie: <https://github.com/ronthecookie>
 * jtsshieh: <https://github.com/jtsshieh>
 *
 * Eventually ended up rewriting the whole thing.
 *
 */

import {
  command,
  default as CookiecordClient,
  Module,
  listener,
  CommonInhibitors,
} from "cookiecord";
import {
  Message,
  MessageEmbed,
  Guild,
  Role,
  TextChannel,
  Channel,
} from "discord.js";
import {
  CHANNEL_PREFIX,
  DORMANT_CHANNEL_TIMEOUT,
  CATEGORIES,
  CHANNEL_NAMES,
  DORMANT_CHANNEL_LOOP,
  COOLDOWN_ROLE,
  COOLDOWN_TIMEOUT,
} from "./config";

import { AVAILABLE_EMBED, DORMANT_EMBED } from "./embeddedMessages";

import {
  initiateOnBoot,
  prepareGuildsCache,
  GUILDCOLLECTION,
} from "./initializing";

import { MINGUILD } from "./types";

import { moveChannel, openHelpChannel, closeHelpChannel } from "./actions";

export default class HelpChannels extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  @listener({ event: "ready" })
  async bootup() {
    try {
      console.log("Start Bootup!");
      let guildCacheReady: boolean[] = await prepareGuildsCache(this.client);

      if (!guildCacheReady.some((b) => !b)) {
        await Promise.all(this.client.guilds.cache.map(initiateOnBoot));
        console.log(GUILDCOLLECTION);
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  @listener({ event: "message" })
  async onMessage(msg: Message) {
    if (msg.author.bot) {
      return;
    }
    let GC: MINGUILD = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== "text" ||
      !msg.channel.parentID ||
      msg.channel.parentID !== GC.categories.get("ask")?.id ||
      !msg.channel.name.startsWith(CHANNEL_PREFIX) ||
      GC.busyChannels.has(msg.channel.id)
    ) {
      console.log("LEAVING MESSAGE EARLY!");
      return;
    } else {
      await openHelpChannel(msg);
    }
    return;
  }

  @command({ aliases: ["resolve", "done", "close"] })
  async resolved(msg: Message) {
    let GC: MINGUILD = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
    // Also triggers on event: "message";
    if (
      msg.channel.type === "text" &&
      (msg.channel.parentID !== GC.categories.get("ongoing")?.id ||
        msg.channel.parentID !== GC.categories.get("dormant")?.id)
    ) {
      let lastPinned = (await msg.channel.messages.fetchPinned()).first();

      if (msg.author.id === lastPinned?.author.id) {
        if (GC.busyChannels.has(msg.channel.id)) {
          // The channel is in a busychannel cache, make sure to move it out.
          console.log("Before closeHelpChannel");
          return await closeHelpChannel(msg);
        }
      } else {
        return;
      }
    }
  }
}
/**
class HelpChannelModule extends Module {
  constructor(client: CookiecordClient) {
    super(client);
  }

  private getChannelName(guild: Guild) {
    // console.log("Getting the channel name");
    const takenChannelNames = guild.channels.cache
      .filter((channel) => channel.name.startsWith(CHANNEL_PREFIX))
      .map((channel) => channel.name.replace(CHANNEL_PREFIX, ""));
    let decidedChannel = CHANNEL_NAMES[0];

    do {
      decidedChannel =
        CHANNEL_NAMES[Math.floor(Math.random() * CHANNEL_NAMES.length)];
    } while (takenChannelNames.includes(decidedChannel));

    return `${CHANNEL_PREFIX}${decidedChannel}`;
  }

  // @listener({ event: "ready" })
  // async prepareModule() {
  //   console.log("Preparing modules");
  //   await this.client.guilds.cache.map(checkForAssetsOnConnection);

  //   return;
  // }

  @listener({ event: "ready" })
  async startDormantLoop() {
    try {
      console.log("Start Setup!");

      console.log("Starting the dormant LOOP");
      setInterval(() => {
        this.checkDormantPossibilities();
      }, DORMANT_CHANNEL_LOOP);
    } catch (error) {
      console.log(error);
    }
  }

  async moveChannel(guild: Guild, channel: TextChannel, category: string) {
    console.log(`Moving the channel: ${channel.name}`);
    const parent = channel.guild.channels.resolve(category);
    if (parent == null) return;
    const data = {
      parentID: parent.id,
      permissionOverwrites: parent.permissionOverwrites,
    };
    await channel.edit(data);
    return;
  }

  @listener({ event: "message" })
  async onNewQuestion(msg: Message) {
    let gc = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;

    if (
      msg.author.bot ||
      !msg.guild ||
      !msg.member ||
      msg.channel.type !== "text" ||
      !msg.channel.parentID ||
      msg.channel.parentID !== gc?.categories.get("ask")?.id ||
      !msg.channel.name.startsWith(CHANNEL_PREFIX) ||
      gc.busyChannels.has(msg.channel.id)
    ) {
      return;
    }

    gc.busyChannels.add(msg.channel.id);
    const cooldownRoleID = gc?.roles.get(COOLDOWN_ROLE)?.id;
    await msg.pin();
    await msg.member.roles.add(cooldownRoleID as string);
    await this.moveChannel(
      msg.channel,
      gc.categories.get("ongoing")?.id as string
    );

    await this.ensureAskChannels(msg.guild);
    // gc.busyChannels.delete(msg.channel.id);
    return;
  }

  @listener({ event: "message" })
  async onNewSystemPinMessage(msg: Message) {
    let gc = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
    if (
      msg.type !== "PINS_ADD" ||
      msg.channel.type !== "text" ||
      !(
        msg.channel.parentID == gc.categories.get("ask")?.id ||
        msg.channel.parentID == gc.categories.get("ongoing")?.id
      )
    ) {
      return;
    }
    await msg.delete({ reason: "Pin system message" });
    return;
  }

  @command({ aliases: ["resolve", "done", "close"] })
  async resolved(msg: Message) {
    let gc = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
    if (
      !(msg.channel.type === "text") ||
      !msg.guild ||
      gc.busyChannels.has(msg.channel.id)
    ) {
      console.log("Leaving Resolved!");
      return;
    }
    console.log(msg);
    const pinned = (await msg.channel.messages.fetchPinned()).first();
    if (
      pinned?.author.id !== msg.author.id &&
      !msg.member?.hasPermission("MANAGE_MESSAGES")
    )
      return await msg.channel.send(
        ":warning: you have to be the asker to close the channel."
      );
    if (msg.channel.parentID !== CATEGORIES.ongoing)
      return await msg.channel.send(
        ":warning: you can only run this in ongoing help channels."
      );

    await this.markChannelAsDormant(msg.channel, pinned);
  }

  async ensureAskChannels(guild: Guild) {
    let gc = GUILDCOLLECTION.get(guild.id);
    while (
      guild.channels.cache
        .filter((channel) => channel.parentID == gc?.categories.get("ask")?.id)
        .filter((channel) => channel.name.startsWith(CHANNEL_PREFIX)).size !== 2
    ) {
      console.log("ensuring");
      const dormant = guild.channels.cache.find(
        (x) => x.parentID == (gc?.categories.get("dormant")?.id as string)
      );
      if (dormant && dormant instanceof TextChannel) {
        await this.moveChannel(
          dormant,
          gc?.categories.get("ask")?.id as string
        );

        const lastMessage = dormant.messages.cache
          .array()
          .reverse()
          .find((m) => m.author.id === this.client.user?.id);
        if (lastMessage) {
          // If there is a last message (the dormant message) by the bot, just edit it
          await lastMessage.edit(AVAILABLE_EMBED);
        } else {
          // Otherwise, just send a new message
          await dormant.send(AVAILABLE_EMBED);
        }
      } else {
        const chan = await guild.channels.create(this.getChannelName(guild), {
          type: "text",
          topic: "Ask your questions here!",
          reason: "maintain help channel goal",
          parent: gc?.categories.get("ask")?.id,
        });

        // Channel should already be in ask, but sync the permissions.
        await this.moveChannel(chan, gc?.categories.get("ask")?.id as string);
        await chan.send(AVAILABLE_EMBED);
      }
    }
  }

  private async markChannelAsDormant(channel: TextChannel, pinned?: Message) {
    let gc = GUILDCOLLECTION.get(channel.guild.id) as MINGUILD;
    if (!pinned) pinned = (await channel.messages.fetchPinned()).first();

    gc.busyChannels.add(channel.id);
    await pinned?.unpin();
    setTimeout(() => {
      pinned?.member?.roles.remove(COOLDOWN_ROLE);
    }, COOLDOWN_TIMEOUT * 1000);

    await this.moveChannel(channel, CATEGORIES.dormant);

    await channel.send(DORMANT_EMBED);

    await this.ensureAskChannels(channel.guild);
    gc.busyChannels.delete(channel.id);
  }

  private async checkDormantPossibilities() {
    const ongoingChannels = this.client.channels.cache.filter((channel) => {
      if (channel.type === "dm") return false;

      return (channel as TextChannel).parentID === CATEGORIES.ongoing;
    });

    for (const channel of ongoingChannels.array()) {
      const messages = await (channel as TextChannel).messages.fetch();

      const diff =
        (Date.now() - messages.array()[0].createdAt.getTime()) / 1000;

      if (diff > DORMANT_CHANNEL_TIMEOUT)
        await this.markChannelAsDormant(channel as TextChannel);
    }
  }

  // Commands to fix race conditions
  @command({
    inhibitors: [CommonInhibitors.hasGuildPermission("MANAGE_MESSAGES")],
  })
  async removelock(msg: Message) {
    let gc = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
    gc.busyChannels.delete(msg.channel.id);
    await msg.channel.send(":ok_hand:");
  }

  @command({
    inhibitors: [CommonInhibitors.hasGuildPermission("MANAGE_MESSAGES")],
  })
  async ensureAsk(msg: Message) {
    if (!msg.guild) return;

    await this.ensureAskChannels(msg.guild);
    await msg.channel.send(":ok_hand:");
  }
}
*/
