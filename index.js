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
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.DISCORD_TOKEN;
const STAFF_CHANNEL_ID = "1495031832784277514";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});


// ✅ COMBINED DEBUG + COMMAND
client.on('messageCreate', async (message) => {
  console.log("Got message:", message.content);

  if (message.author.bot) return;

  if (message.content === "!applypanel") {
    console.log("Command triggered");

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
      const filter = (m) => m.author.id === user.id;

      for (let q of questions) {
        await dm.send(q);

        try {
          const collected = await dm.awaitMessages({
            filter,
            max: 1,
            time: 120000,
            errors: ['time']
          });

          if (!collected.first()) {
            await dm.send("⏰ You didn’t answer in time. Application cancelled.");
            return;
          }

          answers.push(collected.first().content);

        } catch (err) {
          console.error(err);

          if (err.message === 'time') {
            await dm.send("⏰ You didn’t answer in time. Application cancelled.");
          } else {
            await dm.send("❌ Unexpected error occurred.");
          }

          return;
        }
      }

      // 📤 Send answers to staff channel
      const channel = await client.channels.fetch(STAFF_CHANNEL_ID);

      let result = `📋 **New Staff Application**\n\n`;

      questions.forEach((q, i) => {
        result += `**${q}**\n${answers[i]}\n\n`;
      });

      await channel.send(result);

      await dm.send("✅ Your application has been submitted!");

    } catch (err) {
      console.error(err);
      await user.send("❌ You didn’t respond in time or your DMs are closed.");
    }
  }
});

client.login(TOKEN);
