const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// 🔐 Use Railway environment variable
const TOKEN = process.env.MTQ5NTAxOTkzMjYyOTQ3MTMxMw.G2c5g2.NrEk-iECJ8SEA8qipR4W5M73xBWIacoqLkiRWAconst;

// 👉 Put your staff channel ID here
const STAFF_CHANNEL_ID = "1495031832784277514";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// 📌 Command to send apply button
client.on('messageCreate', async (message) => {
  if (message.content === "!applypanel") {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply')
        .setLabel('Apply for Staff')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
      content: "Click below to apply for staff 👇",
      components: [row]
    });
  }
});

// 🔘 Button interaction
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "apply") {
    await interaction.reply({ content: "Check your DMs!", ephemeral: true });

    const user = interaction.user;

    try {
      const dm = await user.createDM();

      const questions = [
        "What is your username?",
        "How old are you?",
        "How many hours can you be active daily?",
        "Do you have staff experience?",
        "Why should we choose you?"
      ];

      let answers = [];

      for (let q of questions) {
        await dm.send(q);

        const collected = await dm.awaitMessages({
          max: 1,
          time: 60000,
          errors: ['time']
        });

        answers.push(collected.first().content);
      }

      // 📤 Send to staff channel
      const channel = await client.channels.fetch(STAFF_CHANNEL_ID);

      let result = `📋 **New Staff Application**\n\n`;

      questions.forEach((q, i) => {
        result += `**${q}**\n${answers[i]}\n\n`;
      });

      await channel.send(result);

      await dm.send("✅ Your application has been submitted!");

    } catch (err) {
      await user.send("❌ You didn’t respond in time or your DMs are closed.");
    }
  }
});

client.login(TOKEN);
