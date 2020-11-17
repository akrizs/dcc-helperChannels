import { MINGUILD } from "./types";
import { Guild, TextChannel, Message, GuildMember } from "discord.js";

import { GUILDCOLLECTION } from "./initializing";

import { COOLDOWN_ROLE } from "./config";

export async function moveChannel(
  guild: Guild,
  channel: TextChannel,
  category: string
) {
  try {
    let GC: MINGUILD = GUILDCOLLECTION.get((guild as Guild).id) as MINGUILD;
    const parent = await channel.guild.channels.resolve(category);
    if (parent == null) throw new Error("Channels category not found!");
    const data = {
      parentID: parent.id,
      permissionOverwrites: parent.permissionOverwrites,
    };
    let ret = await channel.edit(data);

    if (ret == null) throw new Error("Could not move the channel");
    if (parent.id === GC.categories.get("ask")?.id) {
      GC.channels.delete(channel.id);
      GC.busyChannels.add(channel.id);
    } else {
      GC.busyChannels.delete(channel.id);
      GC.channels.add(channel.id);
    }

    return ret;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function openHelpChannel(msg: Message) {
  let GC: MINGUILD = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
  GC.busyChannels.add(msg.channel.id);
  await msg.pin();
  await (msg.member as GuildMember).roles.add(
    GC.roles.get(COOLDOWN_ROLE)?.id as string
  );

  await moveChannel(
    (msg as Message).guild as Guild,
    msg.channel as TextChannel,
    GC.categories.get("ongoing")?.id as string
  );
}

export async function closeHelpChannel(msg: Message) {
  let GC: MINGUILD = GUILDCOLLECTION.get((msg.guild as Guild).id) as MINGUILD;
  console.log("Before moved");
  let moved = await moveChannel(
    (msg as Message).guild as Guild,
    msg.channel as TextChannel,
    GC.categories.get("ask")?.id as string
  );
  console.log(GC.categories.get("ask")?.id as string);

  let lastPinned = (
    await (moved as TextChannel).messages.fetchPinned()
  ).first();
}
