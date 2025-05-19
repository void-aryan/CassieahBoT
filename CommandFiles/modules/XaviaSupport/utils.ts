/**
 * The original code can be found on https://github.com/XaviaTeam/XaviaBot
 * This version is modified only for the sake of COMPATIBILITY of cassidy with xavia commands.
 * Dependent on @xaviabot/fca-unofficial
 * @XaviaTeam
 * @lianecagara
 */

import fs, { PathLike } from "fs";
import axios from "axios";
import FormData from "form-data";
import { randomInt } from "crypto";
import { join } from "path";
import { TMessageSendFunc, XaviaCommandContext } from "./XaviaTypes";
import { ReflectiveMap } from "@cassidy/polyfills/goatbot";

export function request(url: string, options = {}, callback = null) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof callback !== "function") {
    callback = () => {};
  }
  axios(url, options)
    .then((response) => {
      callback(null, response, response.data);
    })
    .catch((error) => {
      callback(error);
    });
}

export const GET = axios.get;

/**
 *
 * @param input - a stringified JSON object
 */
export function isJSON(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param  pathToFile - a path to a file
 */
export function isJSONFile(pathToFile: string): boolean {
  if (!isExists(pathToFile)) return false;

  try {
    return isJSON(fs.readFileSync(pathToFile, "utf8"));
  } catch {
    return false;
  }
}

export function fileStats(path: fs.PathLike) {
  try {
    return fs.statSync(path);
  } catch (e) {
    throw e;
  }
}

/**
 * Checks if a file/directory exists
 * @param path - a path to a file/directory
 * @param type - "file" or "dir"
 */
export function isExists(path: string, type: "file" | "dir" = "file"): boolean {
  try {
    const result = fs.statSync(path);
    return type === "file" ? result.isFile() : result.isDirectory();
  } catch (e) {
    return false;
  }
}

export function reader(path: fs.PathLike) {
  return fs.createReadStream(path);
}

export function writer(path: fs.PathLike) {
  return fs.createWriteStream(path);
}

export function writeFile(
  path: fs.PathOrFileDescriptor,
  data: string | NodeJS.ArrayBufferView<ArrayBufferLike>,
  encoding: BufferEncoding = "utf8"
) {
  return fs.writeFileSync(path, data, encoding);
}

export function readFile(
  path: fs.PathOrFileDescriptor,
  encoding: BufferEncoding = "utf8"
) {
  return fs.readFileSync(path, encoding);
}

export function createDir(path: fs.PathLike) {
  return fs.mkdirSync(path, { recursive: true });
}

/**
 * Download a file from an url which could be video, audio, json, etc.
 *
 * @param path - a path to a file
 * @param src - an src to a file
 * @param headers - custom headers (optional)
 * @returns path
 */
export function downloadFile(
  path: string,
  src: string,
  headers: Record<string, string> = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    GET(src, { responseType: "stream", headers })
      .then((res) => {
        const _writer = writer(path);

        res.data.pipe(_writer);

        _writer.on("error", (err) => {
          reject(err);
        });
        _writer.on("close", () => {
          resolve(path);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function deleteFile(path: fs.PathLike) {
  return fs.unlinkSync(path);
}

export function scanDir(path: fs.PathLike) {
  return fs.readdirSync(path);
}

export function getStream(input: string) {
  return new Promise((resolve, reject) => {
    if (isExists(input)) {
      resolve(reader(input));
    } else {
      if (isURL(input)) {
        GET(input, { responseType: "stream" })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(new Error("Invalid input"));
      }
    }
  });
}

export function getBase64(input: string) {
  return new Promise((resolve, reject) => {
    if (isURL(input)) {
      GET(input, { responseType: "text", responseEncoding: "base64" })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      reject(new Error("Invalid input"));
    }
  });
}

export function isURL(url: string) {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
    url
  );
}

export function buildURL(url: string | { toString: () => string }) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function random(min: string | number, max: string | number) {
  min = Math.floor(+min);
  max = Math.floor(+max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Circle an image
 */
export function circle(
  _image: { width: any; height: any },
  _x: any,
  _y: any,
  _radius: any
) {
  throw new Error("Not supported.");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * for loop minified
 * @param {number} times
 * @param {function} callback
 *
 * @example
 *      // console.log from 0 to 99
 *      loop(100, i => console.log(i));
 */
export function loop(times: number, callback: Function = () => {}) {
  if (times && !isNaN(times) && times > 0) {
    for (let i = 0; i < times; i++) {
      callback(i);
    }
  }
}

export function getRandomHexColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  loop(6, () => {
    color += letters[Math.floor(Math.random() * letters.length)];
  });
  return color;
}

export function getRandomPassword(length = 8, specialChars = false) {
  const letters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
    (specialChars ? "!@#$%^&*()_+~`|}{[]:;?><,./-=" : "");
  let password = "";
  loop(length, () => {
    password += letters[randomInt(0, letters.length)];
  });
  return password;
}

export function addCommas(x: null) {
  if (x === null || x === undefined) return null;
  return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * convert a base64
 * @param {String} file - Path to a file
 */
export function saveToBase64(file: string) {
  let bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap).toString("base64");
}

/**
 * reverse from Base64
 * @param {String} base64 - Base64 string
 */
export function saveFromBase64(path: PathLike, base64: string) {
  return new Promise((resolve, reject) => {
    const bitmap = Buffer.from(base64, "base64");
    const _writer = writer(path);

    _writer.write(bitmap, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(path);
      }

      _writer.destroy();
    });
  });
}

/**
 *
 * @param {string} input base64 string or URL
 * @returns {Promise<string | undefined>}
 */
export async function uploadImgbb(input: string): Promise<string | undefined> {
  try {
    const form = new FormData();
    form.append("key", process.env.IMGBB_KEY);
    form.append("image", input);

    const config = {
      method: "post",
      url: "https://api.imgbb.com/1/upload",
      headers: {
        ...form.getHeaders(),
      },
      data: form,
    };

    const res = await axios(config);
    return res?.data?.data?.url;
  } catch (err) {
    throw err;
  }
}

export function msToHMS(ms: number) {
  let seconds = Number((ms / 1000) % 60),
    minutes = Number(ms / (1000 * 60)) % 60,
    hours = Number((ms / (1000 * 60 * 60)) % 24);

  const _hours = hours < 10 ? "0" + hours : hours;
  const _minutes = minutes < 10 ? "0" + minutes : minutes;
  const _seconds = seconds < 10 ? "0" + seconds : seconds;

  return `${_hours}:${_minutes}:${_seconds}`;
}

export function shuffleArray(_array: string | any[]) {
  const array = [..._array];
  let currentIndex = array.length,
    randomIndex: number;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function expToLevel(exp: any) {
  return Math.floor(Math.pow(exp || 1, 1 / 3));
}

export function levelToExp(level: number) {
  return Math.floor(Math.pow(level, 3));
}

export function getAvatarURL(uid: any) {
  return `https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
}

export function isAcceptableNumber(num: string | number) {
  return !isNaN(Math.floor(Number(num)));
}

export function buildCachePath(path: string) {
  return join(global.cachePath, path);
}

export function buildAssetesPath(path: string) {
  return join(global.assetsPath, path);
}

export function createXaviaMessage(
  event: CommandContext["event"],
  { type, commandName },
  ctx: CommandContext
): XaviaCommandContext["message"] {
  const { api } = ctx;
  const { threadID, messageID, senderID } = event;
  const isReaction = (_type: string = type): _type is "reaction" =>
    _type === "reaction";
  const extraEventProperties: Partial<XaviaCommandContext["message"]> = {
    send: function (message, c_threadID = null, c_messageID = null) {
      return new Promise((resolve, reject) => {
        const targetSendID = c_threadID || threadID;
        api.sendMessage(
          message,
          targetSendID,
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(messageFunctionCallback(data as any, targetSendID));
            }
          },
          c_messageID || null
        );
      });
    },
    reply: function (message) {
      return new Promise((resolve, reject) => {
        api.sendMessage(
          message,
          threadID,
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(messageFunctionCallback(data as any, threadID));
            }
          },
          messageID
        );
      });
    },
    react: function (emoji) {
      return new Promise(async (resolve, reject) => {
        await api.setMessageReaction(
          emoji,
          messageID,
          // @ts-ignore
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
          true
        );
        resolve(undefined);
      });
    },
  };

  if (isReaction) {
    delete extraEventProperties.reply;
    delete extraEventProperties.react;
  }

  const messageFunctionCallback = (
    data: Awaited<ReturnType<TMessageSendFunc>>,
    targetSendID: string
  ) => {
    const baseInput = {
      threadID: targetSendID,
      messageID: data.messageID,
      author: isReaction && "userID" in event ? event.userID : senderID,
      author_only: true,
      name: commandName,
    };

    data.addReplyEvent = function (
      data = {
        author: null,
        author_only: null,
        callback: null,
        messageID: null,
        name: null,
        threadID: null,
      },
      standbyTime = 60000
    ) {
      if (typeof data !== "object" || Array.isArray(data)) return;
      if (typeof data.callback !== "function") return;

      const input = Object.assign(baseInput, data);
      const repliesMap = new ReflectiveMap(global.Cassidy.replies);
      repliesMap.set(input.messageID, input as any);
      if (standbyTime > 0) {
        setTimeout(() => {
          if (repliesMap.has(input.messageID)) {
            repliesMap.delete(input.messageID);
          }
        }, standbyTime);
      }
    };
    data.addReactEvent = function (
      data = {
        author: null,
        author_only: null,
        callback: null,
        messageID: null,
        name: null,
        threadID: null,
      },
      standbyTime = 60000
    ) {
      if (typeof data !== "object" || Array.isArray(data)) return;
      if (typeof data.callback !== "function") return;
      const reactsMap = new ReflectiveMap(global.Cassidy.reacts);

      const input = Object.assign(baseInput, data);
      reactsMap.set(input.messageID, input as any);
      if (standbyTime > 0) {
        setTimeout(() => {
          if (reactsMap.has(input.messageID)) {
            reactsMap.delete(input.messageID);
          }
        }, standbyTime);
      }
    };
    data.unsend = function (delay = 0) {
      const input = Object.assign(baseInput, data);
      setTimeout(
        () => {
          api.unsendMessage(input.messageID);
        },
        delay > 0 ? delay : 0
      );
    };

    return data;
  };

  return extraEventProperties as XaviaCommandContext["message"];
}
