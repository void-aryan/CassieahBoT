import { UNIRedux } from "../modules/unisym.js";

export const meta: CassidySpectra.CommandMeta = {
  name: "rank",
  description: "Displays your in-game rank and experience.",
  version: "1.1.7",
  usage: "{prefix}{name}",
  category: "Utilities",
  author: "JenicaDev",
  permissions: [0],
  noPrefix: false,
  otherNames: ["level", "exp"],
  waitingTime: 0.1,
  cmdType: "cplx_g",
};

export function formatNumber(number) {
  const absNumber = Math.abs(number);

  if (absNumber >= 1e21) {
    return (number / 1e21).toFixed(2) + " Sextillion";
  } else if (absNumber >= 1e18) {
    return (number / 1e18).toFixed(2) + " Quintillion";
  } else if (absNumber >= 1e15) {
    return (number / 1e15).toFixed(2) + " Quadrillion";
  } else if (absNumber >= 1e12) {
    return (number / 1e12).toFixed(2) + " Trillion";
  } else if (absNumber >= 1e9) {
    return (number / 1e9).toFixed(2) + " Billion";
  } else if (absNumber >= 1e6) {
    return (number / 1e6).toFixed(2) + " Million";
  } else if (absNumber >= 1e3) {
    return (number / 1e3).toFixed(2) + " Thousand";
  } else {
    return String(number);
  }
}

export const style: CommandStyle = {
  title: "🌟 Rank",
  titleFont: "bold",
  contentFont: "fancy",
  lineDeco: "altar",
};

export async function entry({ money, input, output, CassEXP }: CommandContext) {
  const progressBar = (prog: number, need: number, totalBars = 7) => {
    const bar = "🟨";
    const empty = "⬜";
    const percent =
      need > 0
        ? Math.min(Math.max(Math.round((prog / need) * 100), 0), 100)
        : 0;
    const filledBars = Math.min(
      Math.max(Math.round((percent / 100) * totalBars), 0),
      totalBars
    );
    const emptyBars = totalBars - filledBars;

    const barX = bar.repeat(filledBars) + empty.repeat(emptyBars);
    return barX;
  };

  if (input.arguments[0] === "top") {
    let { participantIDs = [] } = input;
    if (!Array.isArray(participantIDs)) {
      participantIDs = [];
    }
    const allData = await money.getAll();

    const topList = Object.entries(allData)
      .sort(
        (a, b) =>
          new CassEXP(b[1].cassEXP).getEXP() -
          new CassEXP(a[1].cassEXP).getEXP()
      )
      .slice(0, 10);

    const formattedTopList = topList.map(([, data], index) => {
      const { name, cassEXP } = data;
      const cxp = new CassEXP(cassEXP);

      return `${UNIRedux.arrow} ${index + 1}. ${name} 🌟\n${
        UNIRedux.arrowFromT
      } Level: ${cxp.getLevel()}\n${
        UNIRedux.arrowFromT
      } Experience: ${cxp.getEXP()} / ${cxp.getNextEXP()}\n${
        UNIRedux.arrowFromT
      } Current: ${cxp.getEXPCurrentLv()} / ${
        cxp.getNextEXP() - CassEXP.getEXPFromLevel(cxp.level - 1)
      }\n${UNIRedux.arrowFromT} ${progressBar(
        cxp.getEXPCurrentLv(),
        cxp.getNextEXP()
      )}\n`;
    });

    const response = formattedTopList.length
      ? `🌟 Top 10 List:\n${formattedTopList.join("\n")}`
      : "No data available for the top list.";

    return output.replyStyled(response, {
      ...style,
    });
  }

  let { senderID } = input;
  if (input.replier) {
    ({ senderID } = input.replier);
  }
  if (input.hasMentions) {
    ({ senderID } = input.firstMention);
  }
  if (input.arguments[0]) {
    senderID = input.arguments[0];
  }

  const data = await money.getItem(input.senderID);
  if (!data) {
    return output.reply(
      `${UNIRedux.arrow} ${
        input.senderID !== senderID ? data.name ?? "Unregistered" : "You"
      } are not yet registered in our system.`
    );
  }
  const { cassEXP } = data;
  const cxp = new CassEXP(cassEXP);

  const canv = CanvCass.premade();
  await canv.drawBackground();
  const container = CanvCass.createRect({
    centerX: canv.centerX,
    centerY: canv.centerY,
    height: canv.height / 2,
    width: canv.width,
  });

  canv.drawBox({
    rect: container,
    fill: "rgba(0, 0, 0, 0.5)",
  });

  const margin = 100;

  canv.drawText(`${style.title}`, {
    font: `bold 70px Cassieah-Bold, EMOJI, sans-serif`,
    x: container.left + 50,
    y: container.top - 70,
    align: "left",
    fill: "white",
    baseline: "bottom",
  });

  canv.drawText(`👤 ${data.name}`, {
    font: `bold 50px Cassieah-Bold, EMOJI, sans-serif`,
    x: container.left + margin,
    y: container.top + margin,
    align: "left",
    baseline: "bottom",
    fill: "white",
  });

  const per = Math.min(
    1,
    Math.max(0, cxp.getEXPCurrentLv() / cxp.getNextEXP())
  );

  const bar = CanvCass.createRect({
    left: margin,
    top: container.top + margin + 70 + 20,
    width: canv.width - margin * 2,
    height: 70,
  });
  const barP = CanvCass.createRect({
    left: margin,
    top: container.top + margin + 70 + 20,
    width: (canv.width - margin * 2) * per,
    height: 70,
  });
  canv.drawBox({
    rect: bar,
    fill: "black",
    stroke: "black",
    strokeWidth: 10,
  });
  canv.drawBox({
    rect: barP,
    fill: "white",
  });

  output.reply({
    body: `${UNIRedux.arrow} ${
      input.senderID !== senderID ? data.name ?? "Unregistered" : "You"
    } are at Level ${cxp.getLevel()} with ${cxp.getEXP()} / ${cxp.getNextEXP()} experience points.\n${
      UNIRedux.arrowFromT
    } Current: ${cxp.getEXPCurrentLv()} / ${
      cxp.getNextEXP() - CassEXP.getEXPFromLevel(cxp.level - 1)
    } \n\n${UNIRedux.arrowFromT} ${progressBar(
      cxp.getEXPCurrentLv(),
      cxp.getNextEXP()
    )}`,
    attachment: await canv.toStream(),
  });
}
