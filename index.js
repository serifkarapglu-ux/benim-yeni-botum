import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("👋 Merhaba! Yeni botum aktif 🚀"));
bot.command("ping", (ctx) => ctx.reply("🏓 Pong!"));
bot.on("text", (ctx) => ctx.reply(`🗨️ Yazdığın: ${ctx.message.text}`));

bot.launch()
  .then(() => console.log("✅ Bot aktif!"))
  .catch((err) => console.error("❌ Hata:", err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
