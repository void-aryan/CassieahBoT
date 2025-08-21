// @ts-check
import { UNIRedux } from "@cassidy/unispectra";

export const meta = {
  name: "prefix",
  author: "Liane Cagara",
  version: "4.0.0",
  description: "Nothing special.",
  supported: "^4.0.0",
  order: 4,
  type: "plugin",
  after: ["input", "output"],
};

/**
 *
 * @param {CommandContext} obj
 * @returns
 */
export async function use(obj) {
  const { input, output, prefix, prefixes } = obj;
  const words = ["prefix", "cassidy", "cassieah", "ieah", "zeah"];
  if (
    words.some((w) => `${w}`.toLowerCase() === input.toLowerCase()) ||
    input.text.trim() === prefix
  ) {
    const canv = new CanvCass(CanvCass.preW, CanvCass.preH / 2);
    await canv.drawBackground();

    const container = CanvCass.createRect({
      centerX: canv.centerX,
      centerY: canv.centerY,
      height: canv.height * 0.75,
      width: canv.width,
    });

    canv.drawBox({
      rect: container,
      fill: "rgba(0, 0, 0, 0.5)",
    });

    const lines = CanvCass.lineYs(container.height, 2);
    const d = lines[1] - lines[0];

    const margin = 100;

    canv.drawText(`💌 CassieahBoT`, {
      fontType: "cbold",
      size: 65,
      x: container.left + margin,
      y: lines.at(0) + 65 / 2,
      align: "left",
      baseline: "middle",
      fill: "white",
    });
    canv.drawText(`v${global.package.version}`, {
      fontType: "cbold",
      size: 50,
      x: container.right - margin,
      y: lines.at(0) + 25,
      align: "right",
      baseline: "middle",
      fill: "rgba(255, 255, 255, 0.7)",
    });
    canv.drawText(`Prefixes: [ ${[...prefixes].join(", ")} ]`, {
      fontType: "cbold",
      size: 70,
      x: container.centerX,
      y: lines.at(1) + 35,
      align: "center",
      baseline: "middle",
      fill: "rgba(255, 255, 255, 0.7)",
    });

    return output.replyStyled(
      {
        body: `✨ | **System Prefix:** [ ${prefix} ]
🌠 | **Other Prefixes:** [ ${prefixes.slice(1).join(", ")} ]\n${
          UNIRedux.standardLine
        }\nUse '**${prefix}menu**' to list available commands.`,
        attachment: await canv.toStream(),
      },
      {
        title: global.Cassidy.logo,
        titleFont: "none",
        contentFont: "none",
      }
    );
  } else {
    obj.next();
  }
}
