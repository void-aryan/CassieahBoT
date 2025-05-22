import { CollectibleItem, InventoryItem } from "@cass-modules/cassidyUser";
import { readFileSync } from "fs";
import { Datum } from "./Datum";

export class Inventory<T extends InventoryItem = InventoryItem> {
  limit: number;
  inv: T[];

  constructor(
    inventory: T[] = [],
    limit: number | null = global.Cassidy.invLimit
  ) {
    inventory ??= [];

    this.limit = limit;

    this.inv = this.sanitize(JSON.parse(JSON.stringify(inventory)));
  }
  sanitize(inv = this.inv): T[] {
    if (!Array.isArray(inv)) {
      throw new Error("Inventory must be an array.");
    }
    let result = inv.slice(0, this.limit).map((item, index) => {
      const {
        name = "Unknown Item",
        key = "",
        flavorText = "Mysteriously not known to anyone.",
        icon = "❓",
        type = "generic",
        cannotToss = false,
        sellPrice = 0,
      } = item;
      if (!key) {
        return;
      }

      let result: T = {
        ...item,
        name: String(name),
        key: String(key).replaceAll(" ", ""),
        flavorText: String(flavorText),
        icon: String(icon),
        type: String(type),
        index: Number(index),
        sellPrice: Number(sellPrice),
        cannotToss: !!cannotToss,
      };
      if (type === "food") {
        result.heal ??= 0;
        result.heal = parseInt(String(result.heal));
      }
      if (type === "weapon" || type === "armor") {
        result.atk ??= 0;
        result.def ??= 0;
        result.atk = Number(result.atk);
        result.def = Number(result.def);
      }
      return result;
    });
    return result
      .filter(Boolean)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  at(index: number) {
    const parsedIndex = parseInt(String(index));
    return isNaN(parsedIndex) ? undefined : this.inv.at(parsedIndex - 1);
  }

  getOne(key: string | number): T {
    if (!key) {
      return;
    }
    return this.inv.find((item) => item.key === key) || this.at(Number(key));
  }

  get(key: string | number): T[] {
    if (!key) {
      return [];
    }
    return this.inv.filter(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
  }

  getAll(): T[] {
    return this.inv;
  }

  deleteRef(item: T | string | number) {
    let index =
      typeof item === "string" || typeof item === "number"
        ? -1
        : this.inv.indexOf(item);

    if (index === -1) {
      index = parseInt(String(item)) - 1;
    }

    if (index !== -1 && !isNaN(index)) {
      this.inv.splice(index, 1);
    }
  }

  deleteRefs(items: Parameters<typeof this.deleteRef>[0][]) {
    for (const item of items) {
      this.deleteRef(item);
    }
  }

  findKey(callback: (item: T) => boolean) {
    const result = this.inv.find((item) => callback(item));
    if (result) {
      return result.key;
    } else {
      return null;
    }
  }

  indexOf(item: T): number {
    return this.inv.indexOf(item);
  }

  size(): number {
    return this.inv.length;
  }

  uniqueSize(): number {
    return this.toUnique().length;
  }

  toUnique(callback?: (item: T) => any) {
    return Datum.toUniqueArray<T, any>(this.inv, callback ?? ((i) => i.key));
  }

  toUniqueInventory(callback?: (item: T) => any) {
    return new Inventory<T>(this.toUnique(callback));
  }

  clone(): Inventory<T> {
    return new Inventory<T>(this.inv);
  }

  toJSON(): T[] {
    return this.inv;
  }

  deleteOne(key: string | number): boolean {
    let index = this.inv.findIndex(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
    if (index === -1) {
      index = parseInt(String(key)) - 1;
    }
    if (index === -1 || isNaN(index)) {
      return false;
    }
    this.inv = this.inv.filter((_, i) => i !== index);
  }

  keyAt(index: number | string): string {
    return this.at(Number(index))?.key;
  }

  delete(key: string | number) {
    this.inv = this.inv.filter(
      (item) => item.key !== key || item.key !== this.keyAt(key)
    );
  }

  has(key: string | number): boolean {
    if (!key) {
      return false;
    }
    return this.inv.some(
      (item) => item.key === key || item.key === this.keyAt(key)
    );
  }

  hasAmount(key: string | number, amount: number): boolean {
    const length = this.getAmount(key);
    return length >= amount;
  }

  getAmount(key: string | number): number {
    return this.get(key).length;
  }

  addOne(item: T): number {
    return this.inv.push(item);
  }

  add(item: T[]): number {
    return this.inv.push(...item);
  }

  toss(key: string | number, amount: number | "all") {
    if (amount === "all") {
      amount = this.getAmount(key);
    }

    for (let i = 0; i < amount; i++) {
      this.deleteOne(key);
    }
  }

  /**
   * @deprecated
   */
  tossDEPRECATED(key: string | number, amount: number | "all"): number {
    if (amount === "all") {
      const i = this.getAmount(key);
      this.delete(key);
      return i;
    }
    let r = 0;
    for (let i = 0; i < amount; i++) {
      if (!this.has(key)) {
        break;
      }
      this.deleteOne(key);
      r++;
    }
    return r;
  }

  setAmount(key: string | number, amount: number) {
    const data = this.get(key);
    for (let i = 0; i < amount; i++) {
      this.addOne(data[i]);
    }
  }

  *[Symbol.iterator]() {
    yield* this.inv;
  }

  raw(): T[] {
    return Array.from(this.inv);
  }

  *keys() {
    yield* this.inv.map((item) => item.key);
  }

  static from<T extends InventoryItem>(data: T, key = "inventory") {
    if (Array.isArray(data)) {
      return new Inventory<T>(data);
    }
    if (data instanceof Inventory) {
      return data.clone();
    }
    if (typeof data === "object" && data && key in data) {
      return new Inventory<T>(data[key] as T[]);
    }
    return new Inventory<T>([]);
  }
}

export class Collectibles<T extends CollectibleItem = CollectibleItem> {
  #collectibles: T[];

  constructor(collectibles: T[] = []) {
    this.#collectibles = this.sanitize(collectibles);
    try {
      const data = JSON.parse(
        readFileSync(
          process.cwd() +
            "/CommandFiles/resources/collectibles/collectibles.json",
          "utf-8"
        )
      );
      for (const key in data) {
        const meta = data[key];
        this.register(key, meta);
      }
    } catch (error) {
      console.error(error);
    }
  }

  get collectibles() {
    return this.#collectibles;
  }

  sanitize(c = this.#collectibles) {
    const collectibleMap = new Map<string, T>();

    for (let i = c.length - 1; i >= 0; i--) {
      const collectible = c[i];
      if (!collectible.metadata) continue;

      let {
        key,
        name = "Unknown Collectible",
        icon = "❓",
        type = "generic",
        limit = undefined,
      } = collectible.metadata;

      if (!key) continue;

      if (collectibleMap.has(key)) {
        collectibleMap.get(key).amount += Math.abs(collectible.amount);
      } else {
        collectibleMap.set(key, {
          metadata: { key, name, icon, type, limit },
          amount: Math.abs(collectible.amount),
        } as T);
      }
    }

    return Array.from(collectibleMap.values());
  }
  register(key: string, metadata: T["metadata"]) {
    let index = this.#collectibles.findIndex((c) => c?.metadata.key === key);
    if (index === -1) {
      this.#collectibles.push({ metadata, amount: 0 } as T);
      index = this.#collectibles.length - 1;
    } else {
      this.#collectibles[index].metadata = metadata;
    }
    this.#collectibles = this.sanitize(this.#collectibles);
    this.combineDuplicates();
    return index;
  }

  combineDuplicates() {
    const collectibleMap = new Map();
    for (const collectible of this.#collectibles) {
      const key = collectible.metadata.key;
      const amount = collectible.amount;
      if (collectibleMap.has(key)) {
        collectibleMap.get(key).amount += amount;
      } else {
        collectibleMap.set(key, { ...collectible });
      }
    }
    this.#collectibles = Array.from(collectibleMap.values());
  }

  raiseOne(key: string) {
    return this.raise(key, 1);
  }

  getAll() {
    return this.collectibles;
  }

  toJSON() {
    return this.getAll();
  }

  *[Symbol.iterator]() {
    yield* this.collectibles;
  }

  *keys() {
    yield* this.collectibles.map((c) => c.metadata.key);
  }

  raise(key: string, amount = 0) {
    this.validate(key);
    if (isNaN(amount)) {
      throw new Error("Amount must be a number.");
    }
    const data = this.get(key);
    data.amount = (data.amount ?? 0) + amount;
    if (data.metadata.limit) {
      data.amount = Math.min(data.amount, data.metadata.limit);
    }
    return data.amount;
  }

  get(key: string) {
    return this.collectibles.find((c) => c?.metadata.key === key);
  }

  set(key: string, amount: number) {
    this.validate(key);
    const index = this.#collectibles.findIndex((c) => c?.metadata.key === key);
    if (index !== -1) {
      this.#collectibles[index].amount = amount;
      if (this.#collectibles[index].metadata.limit) {
        this.#collectibles[index].amount = Math.min(
          this.#collectibles[index].amount,
          this.#collectibles[index].metadata.limit
        );
      }
    }
    return index;
  }

  getAmount(key: string) {
    return this.get(key)?.amount ?? 0;
  }

  hasAmount(key: string, amount: number) {
    return this.getAmount(key) >= (amount ?? 1);
  }

  has(key: string) {
    return this.get(key) !== undefined;
  }

  atLimit(key: string) {
    const data = this.get(key);
    return (
      data?.metadata.limit !== undefined && data.amount >= data.metadata.limit
    );
  }

  validate(key: string) {
    if (!this.get(key)) {
      throw new Error(`Collectible "${key}" is not yet registered.`);
    }
  }

  getMeta(key: string) {
    return this.get(key)?.metadata;
  }

  remove(key: string) {
    this.validate(key);
    this.#collectibles = this.#collectibles.filter(
      (c) => c?.metadata.key !== key
    );
  }

  removeEmpty() {
    for (const key of this.keys()) {
      const amount = this.getAmount(key);
      if (amount === 0) {
        this.remove(key);
      }
    }
    return this.collectibles;
  }

  resetAmount(key: string) {
    this.validate(key);
    const data = this.get(key);
    if (data) {
      data.amount = 0;
    }
    return data.amount;
  }
}
