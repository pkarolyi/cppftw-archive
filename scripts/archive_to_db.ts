import { ArchiveMessageType, PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

console.log(
  "Assuming clean database. If you have previous messages loaded reset the database!"
);

const prisma = new PrismaClient({});

const ARCHIVE_DIR = path.join(process.cwd(), process.argv[2]);

const ONLY = process.argv[3] || null;

async function createUsers(users: any[]) {
  // create user from users.json
  await prisma.archiveUser.createMany({
    data: users.map((u) => ({
      id: u.id,
      name: u.profile.display_name || u.name,
      imageUrl: u.profile.image_72,
    })),
  });

  // create special users
  await prisma.archiveUser.create({
    data: {
      id: "USLACKBOT",
      name: "Slackbot",
      imageUrl: "https://a.slack-edge.com/80588/img/slackbot_72.png",
    },
  });
  await prisma.archiveUser.create({
    data: {
      id: "NO_ID",
      name: "[some_bot]",
    },
  });
  await prisma.archiveUser.create({
    data: {
      id: "UNKNOWN_ID",
      name: "[external_user]",
    },
  });
}

async function createMessages(
  channelId: string,
  users: any[],
  messages: any[]
) {
  const processedMessages: any[] = [];
  const childMeta: any = {};
  const parentLookup: any = {};
  for (const message of messages) {
    // some random entries are not messages, these don't have a ts
    if (!message.ts) continue;

    // resolve missing or unknown user IDs
    if (!message.user) {
      message.user = "NO_ID";
    } else if (
      message.user !== "USLACKBOT" &&
      !users.find((u) => u.id === message.user)
    ) {
      message.user = "UNKNOWN_ID";
    }

    // messages don't have a consistent ID so we generate one
    message.id = randomUUID();

    // determine message type (need long checks because of inconsistencies)
    if (message.thread_ts && message.parent_user_id && !message.reply_count) {
      // message is in a thread
      if (message.subtype === "thread_broadcast" && message.root) {
        // message is also sent to channel
        message.type = ArchiveMessageType.THREAD_CHILD_BROADCAST;
      } else {
        message.type = ArchiveMessageType.THREAD_CHILD;
      }
      // populate parent-searching metadata for child
      childMeta[message.id] = {
        parent_user_id: message.parent_user_id,
        thread_ts: message.thread_ts,
      };
    } else {
      // message is not in a thread
      if (message.thread_ts && message.reply_count) {
        // message has thread replies
        message.type = ArchiveMessageType.THREAD_PARENT;
        // speed-up lookup for finding this as a parent
        parentLookup[message.ts] = message.id;
      } else {
        message.type = ArchiveMessageType.NORMAL;
      }
    }

    processedMessages.push({
      id: message.id,
      ts: message.ts,
      type: message.type,
      isoDate: new Date(message.ts.split(".")[0] * 1000).toISOString(),
      text: message.text || "[empty_message_text]",
      userId: message.user,
      channelId: channelId,
    });
  }

  // for thread messages we need to find their parent
  const finalMessages: any[] = [];
  for (const message of processedMessages) {
    if (
      message.type === ArchiveMessageType.THREAD_CHILD ||
      message.type === ArchiveMessageType.THREAD_CHILD_BROADCAST
    ) {
      const meta = childMeta[message.id];
      const parentId = parentLookup[meta.thread_ts];
      if (parentId) {
        message.parentId = parentId;
      } else {
        console.warn("No parent for thread message", message.ts);
        throw new Error();
      }
    }

    finalMessages.push(message);
  }

  await prisma.archiveMessage.createMany({
    data: finalMessages,
  });
}

async function createChannels(users: any[], channels: any[]) {
  for (const channel of channels) {
    console.log(`  importing ${channel.name}...`);

    await prisma.archiveChannel.create({
      data: {
        name: channel.name,
        id: channel.id,
        isGeneral: channel.is_general,
      },
    });

    const channelDir = path.join(ARCHIVE_DIR, channel.name);
    const files = fs.readdirSync(channelDir);

    const messages: any[] = [];
    for (const file of files) {
      const filePath = path.join(channelDir, file);
      const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      messages.push(...fileContent);
    }

    await createMessages(channel.id, users, messages);
  }
}

async function main() {
  console.log("Importing users...");
  const users: any[] = JSON.parse(
    fs.readFileSync(path.join(ARCHIVE_DIR, "users.json"), "utf-8")
  );

  await createUsers(users);

  console.log("Importing channels...");
  const channels: any[] = JSON.parse(
    fs.readFileSync(path.join(ARCHIVE_DIR, "channels.json"), "utf-8")
  ).filter((ch: any) => (ONLY ? ch.name === ONLY : true));

  await createChannels(users, channels);
}

main();
