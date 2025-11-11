import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Webhook sıfırla (Render çakışma çözümü)
(async () => {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`, { url: "" });
    console.log("🔄 Webhook temizlendi, polling modu aktif.");
  } catch {
    console.log("⚠️ Webhook zaten temiz.");
  }
})();

// === Komutlar ===

// /start
bot.start((ctx) =>
  ctx.reply(
    "🌹 Merhaba, ben *Görsel Şair Bot* 🎨\n" +
    "Yazdığın sözcüklerden şiir ve resim üretirim.\n" +
    "Denemek için /şiir veya /benimsözüm yaz.",
    { parse_mode: "Markdown" }
  )
);

// /şiir
bot.command("şiir", async (ctx) => {
  const prompt = "duygusal kısa şiir, türkçe, estetik imgelerle";
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/images/generations",
      { prompt, size: "512x512" },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` } }
    );

    const img = res.data.data[0].url;
    const poem = [
      "Bir gül açar gecenin sesinde,",
      "Ay ışığı düşer sözcüklerime.",
      "Kalemim sen, ilhamım yine sen,",
      "Susarım… ama kalbim söyler şiirime."
    ].sort(() => 0.5 - Math.random()).slice(0, 4).join("\n");

    await ctx.replyWithPhoto(img, { caption: `🖋️ *Şiir:*\n${poem}`, parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("⚠️ Görsel oluşturulamadı (API KEY kontrol et).");
  }
});

// /benimsözüm
bot.command("benimsözüm", (ctx) => {
  const name = ctx.from.first_name || "Birisi";
  const lines = [
    `${name} dedi ki: "Gülmeyi unutma, çünkü kader bile buna alışamadı."`,
    `${name}: "Sessizlik bazen kelimelerden daha gürültülüdür."`,
    `${name}: "Bazen bir tebessüm, bin gözyaşını siler."`
  ];
  const text = lines[Math.floor(Math.random() * lines.length)];
  ctx.reply(`🌸 *${text}*`, { parse_mode: "Markdown" });
});

// Otomatik şiir paylaşımları (her 6 saatte)
setInterval(async () => {
  const verse = [
    "🌙 Geceye yazdım adını yıldızlarla...",
    "💫 Gözlerimdeki umut seninle yanar.",
    "🔥 Sessizlikte büyür en güzel haykırış."
  ][Math.floor(Math.random() * 3)];

  for (const id of groupList) {
    try {
      await bot.telegram.sendMessage(id, verse);
    } catch {}
  }
}, 6 * 60 * 60 * 1000);

// Grup kaydı
const groupList = new Set();
bot.on("my_chat_member", (ctx) => {
  const s = ctx.myChatMember.new_chat_member.status;
  if (s === "member" || s === "administrator") {
    groupList.add(ctx.chat.id);
    ctx.reply("🎭 Görsel Şair geldi, kelimelere ruh verecek!");
  }
});

bot.launch()
  .then(() => console.log("✅ Görsel Şair Bot aktif!"))
  .catch((e) => console.error("❌ Hata:", e));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
