import {
  Canvas,
  CanvasRenderingContext2D,
  CanvasTextAlign,
  CanvasTextBaseline,
  GlobalFonts,
  Image,
  SKRSContext2D,
  createCanvas,
  loadImage,
} from "@napi-rs/canvas";
import { randomUUID } from "crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  ReadStream,
  unlinkSync,
} from "fs";
import { join } from "path";

let sharedBG: Image = null;

export class CanvCass {
  static registerFont(font: CanvCass.Font) {
    CanvCass.fonts.registerFromPath(font.path, font.name);
  }

  static async singleSetup() {
    logger("Registering fonts...", "CanvCass");
    this.registerFont({
      name: "EMOJI",
      path: "./public/NotoColorEmoji.ttf",
    });
    this.registerFont({
      name: "Cassieah",
      path: "./public/fonts/SFPRODISPLAYREGULAR.OTF",
    });
    this.registerFont({
      name: "Cassieah-Bold",
      path: "./public/fonts/SFPRODISPLAYBOLD.OTF",
    });

    logger("Fonts registered!", "CanvCass");
  }

  static fonts = GlobalFonts;

  #config: CanvCass.CreateConfig;

  canvas: Canvas;
  #context: SKRSContext2D;
  static createRect(basis: Partial<CanvCass.MakeRectParam>): CanvCass.Rect {
    const { width, height } = basis;

    if (typeof width !== "number" || typeof height !== "number") {
      throw new Error(
        "createRect: width and height must be provided as numbers."
      );
    }

    const centerX =
      basis.centerX ??
      (typeof basis.left === "number" ? basis.left + width / 2 : undefined);
    const centerY =
      basis.centerY ??
      (typeof basis.top === "number" ? basis.top + height / 2 : undefined);

    const left =
      basis.left ??
      (typeof centerX === "number" ? centerX - width / 2 : undefined);
    const top =
      basis.top ??
      (typeof centerY === "number" ? centerY - height / 2 : undefined);

    if (typeof left !== "number" || typeof top !== "number") {
      throw new Error(
        "createRect: insufficient data to calculate position. Provide at least (left & top) or (centerX & centerY)."
      );
    }

    return {
      width,
      height,
      left,
      top,
      right: left + width,
      bottom: top + height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  }

  constructor(width: number, height: number);
  constructor({ width, height, background }: CanvCass.CreateConfig);

  constructor(...args: [number, number] | [CanvCass.CreateConfig]) {
    let config: CanvCass.CreateConfig;

    if (typeof args[0] === "number" && typeof args[1] === "number") {
      config = {
        width: args[0],
        height: args[1],
      };
    } else if (config && "width" in config && "height" in config) {
      config = args[0] as CanvCass.CreateConfig;
    } else {
      throw new TypeError("Invalid First Parameter (Config)");
    }

    config.background ??= null;

    this.#config = config;
    this.canvas = createCanvas(config.width, config.height);
    this.#context = this.canvas.getContext("2d");
  }

  static premade() {
    return new CanvCass(1024, 768);
  }

  get config() {
    return this.#config;
  }

  get width() {
    return this.#config.width;
  }
  get height() {
    return this.#config.height;
  }
  get left() {
    return 0;
  }
  get top() {
    return 0;
  }
  get right() {
    return this.width;
  }
  get bottom() {
    return this.height;
  }
  get centerX() {
    return this.width / 2;
  }
  get centerY() {
    return this.height / 2;
  }

  async drawBackground() {
    if (this.#config.background !== null) {
      this.drawBox({
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height,
        fill: this.#config.background,
      });
    } else {
      const bg = await loadImage(
        join(process.cwd(), "public", "canvcassbg.png")
      );
      this.#context.drawImage(bg, this.left, this.top, this.width, this.height);
    }
  }

  get rect(): CanvCass.Rect {
    return {
      width: this.width,
      height: this.height,
      left: this.left,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      centerX: this.centerX,
      centerY: this.centerY,
    };
  }

  exposeContext() {
    return this.#context;
  }

  withContext(cb: (ctx: CanvasRenderingContext2D) => void): void {
    const ctx = this.#context;
    ctx.save();
    try {
      cb(ctx);
    } finally {
      ctx.restore();
    }
  }

  toPng() {
    return this.canvas.toBuffer("image/png");
  }

  toStream(): Promise<ReadStream> {
    const tempDir = join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    const filename = `${randomUUID()}.png`;
    const filePath = join(tempDir, filename);
    const buffer = this.canvas.toBuffer("image/png");

    return new Promise((resolve, reject) => {
      const out = createWriteStream(filePath);

      out.on("error", reject);

      out.write(buffer, (err) => {
        if (err) return reject(err);
        out.end();
      });

      out.on("finish", () => {
        const stream = createReadStream(filePath);
        stream.on("close", () => {
          try {
            unlinkSync(filePath);
          } catch (err) {
            console.error(`Failed to delete temp file ${filePath}`, err);
          }
        });
        resolve(stream);
      });
    });
  }

  drawBox(
    rect: CanvCass.Rect,
    style?: Partial<CanvCass.DrawBoxInlineParam>
  ): void;
  drawBox(style: CanvCass.DrawBoxInlineParam): void;
  drawBox(
    left: number,
    top: number,
    width: number,
    height: number,
    style?: Partial<CanvCass.DrawBoxInlineParam>
  ): void;

  drawBox(
    arg1: number | CanvCass.Rect | CanvCass.DrawBoxInlineParam,
    arg2?: number | Partial<CanvCass.DrawBoxInlineParam>,
    arg3?: number,
    arg4?: number,
    arg5?: Partial<CanvCass.DrawBoxInlineParam>
  ): void {
    let rect: CanvCass.Rect;
    let style: CanvCass.DrawParam = {};

    if (
      typeof arg1 === "number" &&
      typeof arg2 === "number" &&
      typeof arg3 === "number" &&
      typeof arg4 === "number"
    ) {
      rect = CanvCass.createRect({
        left: arg1,
        top: arg2,
        width: arg3,
        height: arg4,
      });
      style = arg5 ?? {};
    } else if ("centerX" in (arg1 as CanvCass.Rect)) {
      rect = arg1 as CanvCass.Rect;
      style = (arg2 as CanvCass.DrawParam) ?? {};
    } else {
      const inline = arg1 as CanvCass.DrawBoxInlineParam;
      rect = CanvCass.createRect({
        ...inline,
      });
      style = inline;
    }

    const ctx = this.#context;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.left, rect.top, rect.width, rect.height);

    if (style.stroke) {
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = Number(style.strokeWidth ?? "1");
      ctx.stroke();
    }

    if (style.fill) {
      ctx.fillStyle = style.fill;
      ctx.fill();
    }

    ctx.restore();
  }

  drawPolygon(points: number[][], style?: CanvCass.DrawParam): void {
    if (!Array.isArray(points) || points.length < 3) {
      throw new Error("drawPolygon requires at least 3 points.");
    }

    const ctx = this.#context;
    const { fill, stroke, strokeWidth } = style ?? {};

    ctx.save();
    ctx.beginPath();

    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.closePath();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Number(strokeWidth ?? "1");
      ctx.stroke();
    }

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.restore();
  }

  drawLine(
    start: [number, number],
    end: [number, number],
    style?: CanvCass.DrawParam
  ): void;
  drawLine(points: [number, number][], style?: CanvCass.DrawParam): void;
  drawLine(
    arg1: [number, number] | [number, number][],
    arg2?: [number, number] | CanvCass.DrawParam,
    arg3?: CanvCass.DrawParam
  ): void {
    let start: [number, number];
    let end: [number, number];
    let style: CanvCass.DrawParam = {};

    if (Array.isArray(arg1[0])) {
      const points = arg1 as [number, number][];
      if (points.length !== 2) {
        throw new Error("drawLine requires exactly two points.");
      }
      [start, end] = points;
      style = (arg2 as CanvCass.DrawParam) ?? {};
    } else {
      start = arg1 as [number, number];
      end = arg2 as [number, number];
      style = arg3 ?? {};
    }

    const ctx = this.#context;
    const { stroke, strokeWidth } = style;

    if (!stroke) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Number(strokeWidth ?? "1");
    ctx.stroke();
    ctx.restore();
  }

  drawCircle(
    center: [number, number],
    radius: number,
    style?: CanvCass.DrawCircleParamN
  ): void;
  drawCircle(config: CanvCass.DrawCircleParam): void;
  drawCircle(
    arg1: [number, number] | CanvCass.DrawCircleParam,
    arg2?: number,
    arg3?: CanvCass.DrawCircleParamN
  ): void {
    let centerX: number;
    let centerY: number;
    let radius: number;
    let style: CanvCass.DrawParam = {};

    if (
      typeof arg1 === "number" &&
      typeof arg2 === "number" &&
      typeof arg3 !== "number"
    ) {
      centerX = arg1;
      centerY = arg2;
      radius = arg3?.radius ?? 0;
      style = arg3 ?? {};
    } else if (Array.isArray(arg1) && typeof arg3 !== "number") {
      centerX = arg1[0];
      centerY = arg1[1];
      radius = arg2 ?? 0;
      style = arg3 ?? {};
    } else {
      const config = arg1 as CanvCass.DrawCircleParam;
      [centerX, centerY] = config.center;
      radius = config.radius;
      style = config;
    }

    const ctx = this.#context;
    const { fill, stroke, strokeWidth } = style;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Number(strokeWidth ?? "1");
      ctx.stroke();
    }

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.restore();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options?: Partial<CanvCass.DrawTextParam>
  ): void;
  drawText(text: string, options: Partial<CanvCass.DrawTextParam>): void;
  drawText(config: CanvCass.DrawTextParam): void;

  drawText(
    arg1: string | CanvCass.DrawTextParam,
    arg2?: number | Partial<CanvCass.DrawTextParam>,
    arg3?: number,
    arg4?: Partial<CanvCass.DrawTextParam>
  ): void {
    const ctx = this.#context;

    let text: string;
    let x: number;
    let y: number;
    let options: Partial<CanvCass.DrawTextParam> = {};

    if (
      typeof arg1 === "string" &&
      typeof arg2 === "number" &&
      typeof arg3 === "number"
    ) {
      text = arg1;
      x = arg2;
      y = arg3;
      options = arg4 ?? {};
    } else if (typeof arg1 === "string" && typeof arg2 === "object") {
      text = arg1;
      const opt = arg2 as Partial<CanvCass.DrawTextParam>;
      x = opt.x ?? 0;
      y = opt.y ?? 0;
      options = opt;
    } else {
      const config = arg1 as CanvCass.DrawTextParam;
      text = config.text;
      x = config.x;
      y = config.y;
      options = config;
    }

    const {
      fill = "white",
      stroke,
      strokeWidth = 1,
      font = `16px "Cassieah"`,
      align = "center",
      baseline = "middle",
    } = options;

    ctx.save();

    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    }

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, x, y);
    }

    ctx.restore();
  }

  async drawImage(
    image: Image,
    x: number,
    y: number,
    options?: { width?: number; height?: number }
  ): Promise<void>;
  async drawImage(
    src: string | Buffer,
    x: number,
    y: number,
    options?: { width?: number; height?: number }
  ): Promise<void>;

  async drawImage(
    imageOrSrc: string | Buffer | Image,
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
    }
  ): Promise<void> {
    const ctx = this.#context;

    let image: Image;

    if (typeof imageOrSrc !== "string" && "onload" in imageOrSrc) {
      image = imageOrSrc;
    } else {
      image = await loadImage(imageOrSrc);
    }

    ctx.save();

    if (options?.width && options?.height) {
      ctx.drawImage(image, x, y, options.width, options.height);
    } else {
      ctx.drawImage(image, x, y);
    }

    ctx.restore();
  }
}

export namespace CanvCass {
  export interface Font {
    name: string;
    path: string;
  }

  export interface CreateConfig {
    width: number;
    height: number;
    background?: string | null;
  }
  export type MakeRectParam = {
    width: number;
    height: number;
    top?: number;
    left?: number;
    centerX?: number;
    centerY?: number;
  };

  export interface DrawParam {
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
  }

  export type DrawBoxInlineParam = DrawParam & MakeRectParam;

  export interface Rect {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  }

  export interface DrawCircleParam extends DrawParam {
    center: [number, number];
    radius: number;
  }
  export interface DrawCircleParamN extends DrawParam {
    center?: [number, number];
    radius?: number;
  }

  export interface DrawTextParam {
    text: string;
    x: number;
    y: number;
    font?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  }
}
