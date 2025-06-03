import { AxiosRequestConfig } from "axios";
import { StrictOutputForm } from "output-cassidy";

export default easyCMD({
  name: "gpt",
  meta: {
    otherNames: ["gpt4o", "ai", "ask"],
    author: "From Haji Mix REST API",
    description:
      "A versatile assistant that provides information, answers questions, and assists with a wide range of tasks.",
    icon: "🤖",
    version: "1.2.0",
    noPrefix: "both",
  },
  title: {
    content: "GPT-4O FREE 🖼️🎓",
    text_font: "bold",
    line_bottom: "default",
  },
  content: {
    content: null,
    text_font: "none",
    line_bottom: "hidden",
  },
  async run({ output, args, commandName, prefix, input, cancelCooldown }) {
    let ask = args.join(" ");
    if (!ask) {
      cancelCooldown();
      return output.reply(
        `🔎 Please provide a question for **gpt**.\n\n***Example*** ${prefix}${commandName} what is tralalero tralala?`
      );
    }

    if (input.attachmentUrls.length > 0) {
      ask = `${ask}\n\nMy Attachments:\n\n${input.attachmentUrls.join("\n")}`;
    }

    const headers: AxiosRequestConfig["headers"] = {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      "Sec-CH-UA":
        '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      Cookie: "__stripe_mid=7cee4280-8e2d-43b6-a714-a99393dc8fb0a84de5",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    };

    const res: ResponseType = await output.req(
      "https://haji-mix.up.railway.app/api/gpt4o",
      {
        uid: input.sid + "_7",
        ask,
      },
      {
        headers,
      }
    );

    const form: StrictOutputForm = {
      body: res.answer,
    };

    if (Array.isArray(res.images)) {
      for (const image of res.images) {
        if (typeof image.description === "string") {
          form.body = `${image.description}`;
        }
        if (typeof image.url === "string") {
          form.attachment = await global.utils.getStreamFromURL(image.url);
        }
      }
    }
    console.log(res, form);

    return output.reply(form);
  },
});

export interface ResponseType {
  user_ask: string;
  answer: string;
  images?: {
    description?: string;
    url?: string;
  }[];
}
