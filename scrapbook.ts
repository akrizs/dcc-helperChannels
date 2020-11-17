if (
      !(msg.channel.type === "text") ||
      !msg.guild ||
      !GC.busyChannels.has(msg.channel.id) ||
      msg.channel.parentID === GC.categories.get("ongoing")?.id ||
      msg.channel.parentID === GC.categories.get("dormant")?.id
    ) {
      console.log("Leaving Resolved! EARLY!");
      return;
    }

    const pinned = (await msg.channel.messages.fetchPinned()).first();
    console.log(pinned);
    if (
      pinned?.author.id !== msg.author.id &&
      !msg.member?.hasPermission("MANAGE_MESSAGES")
    ) {
      return await msg.channel.send(
        ":warning: you have to be the asker to close the channel."
      );
    }

    if (msg.channel.parentID !== CATEGORIES.ongoing) {
      return await msg.channel.send(
        ":warning: you can only run this in ongoing help channels."
      );
    }

    console.log("FROM RESOLVED!");
  }