import { default as CookiecordClient } from "cookiecord";

import { Guild, Role, Channel } from "discord.js";

import {
  CHANNEL_PREFIX,
  CATEGORIES,
  CHANNEL_NAMES,
  COOLDOWN_ROLE,
  ACCENT_COLOR,
} from "./config";

import { MINGUILD } from "./types";

import { AVAILABLE_EMBED } from "./embeddedMessages";

export const GUILDCOLLECTION: Map<string, MINGUILD> = new Map();

export async function prepareGuildsCache(
  client: CookiecordClient
): Promise<any> {
  const guilds = client.guilds.cache;
  return Promise.all(
    guilds.map((g) => {
      return new Promise((res) => {
        GUILDCOLLECTION.set(g.id, {
          categories: new Map(),
          channels: new Set(),
          busyChannels: new Set(),
          roles: new Map(),
        });
        res(true);
      });
    })
  );
}

export function initiateOnBoot(guild: Guild): Promise<any> {
  return new Promise((res, rej) => {
    createCoolDownRole(guild).then(() => {
      createCategoriesNeeded(guild).then(() => {
        createChannelsNeeded(guild).then(() => {
          res(true);
        });
      });
    });
  });
}

export async function createCoolDownRole(guild: Guild): Promise<Role> {
  if (
    !!!guild.roles.cache.find((r) => {
      return r.name.toLowerCase() === COOLDOWN_ROLE.toLowerCase();
    })
  ) {
    // Role doesn't exist, create it and return it.
    let role = await guild.roles.create({
      data: {
        name: COOLDOWN_ROLE,
        color: ACCENT_COLOR,
      },
      reason: "Cooldown role for ask module",
    });
    let gc = GUILDCOLLECTION.get(guild.id);

    gc?.roles.set(role.name, {
      name: role.name,
      id: role.id,
    });
    return role;
  } else {
    // Role exists, get it and return it!
    let role: Role = (await guild.roles.cache.find((r) => {
      return r.name.toLowerCase() === COOLDOWN_ROLE.toLowerCase();
    })) as Role;

    let gc = GUILDCOLLECTION.get(guild.id);

    gc?.roles.set(role.name, {
      name: role.name,
      id: role.id,
    });

    return role;
  }
}

export async function createCategoriesNeeded(guild: Guild): Promise<any> {
  let categories = Object.entries(CATEGORIES).map(
    async ([k, n]): Promise<any> => {
      if (
        !!guild.channels.cache.find((c) => {
          return c.name === n && c.type === "category";
        })
      ) {
        // Get the existing category and input it to the correct storage.
        let category = await guild.channels.cache.find((c) => {
          return c.name === n && c.type === "category";
        });
        let gcc = GUILDCOLLECTION.get(guild.id)?.categories;
        gcc?.set(k, {
          name: category?.name as string,
          id: category?.id as string,
        });
        return category;
      } else {
        // Create the category!
        let category = await guild.channels.create(n, {
          type: "category",
        });
        let gcc = GUILDCOLLECTION.get(guild.id)?.categories;
        gcc?.set(k, {
          name: category?.name as string,
          id: category?.id as string,
        });
        return category;
      }
    }
  );
  return await Promise.all(categories);
}

export async function createChannelsNeeded(guild: Guild): Promise<any> {
  let askChID = GUILDCOLLECTION.get(guild.id)?.categories.get("ask")?.id;

  let channels = CHANNEL_NAMES.map(async (cname) => {
    cname = `${CHANNEL_PREFIX}${cname}`;
    if (
      !!guild.channels.cache.find((c) => {
        return c.name === cname && c.type === "text";
      })
    ) {
      // The channel does exist ?
      let channel = await guild.channels.cache.find((c) => {
        return c.name === cname && c.type === "text";
      });
      // check who is the parent, if it is not askChID then put it in busy
      let gc =
        channel?.parentID === askChID
          ? GUILDCOLLECTION.get(guild.id)?.channels
          : GUILDCOLLECTION.get(guild.id)?.busyChannels;
      gc?.add((channel as Channel).id);
      return channel;
    } else {
      // Create the channel!
      let channel = await guild.channels.create(cname, {
        type: "text",
        parent: askChID,
      });
      let gc = GUILDCOLLECTION.get(guild.id)?.channels;
      gc?.add(channel.id);

      let msg = await channel.send({
        embed: AVAILABLE_EMBED,
      });

      // await msg.pin();

      return channel;
    }
  });

  return Promise.all(channels);
}
