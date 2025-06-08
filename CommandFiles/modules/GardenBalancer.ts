import { GardenItem, GardenSeed } from "@cass-commands/grow_garden";

export interface ShopItem {
  icon: string;
  name: string;
  key: string;
  flavorText: string;
  price: number;
  rarity: string;
  stockLimit: number;
  stockChance: number;
  inStock: boolean;
  onPurchase: (args: { moneySet: { inventory: GardenItem[] } }) => void;
  [key: string]: unknown;
}

export interface ItemBalanceResult {
  name: string;
  key: string;
  score: number;
  price: number;
  baseValue: number;
  harvests: number;
  growthTime: number;
  pricePerHarvest: number;
  profitPerHarvest: number;
  timeEfficiency: number;
  costEfficiency: number;
  rarity: string;
  item: GardenSeed;
  stockChance: number;
}

export function evaluateItemBalance(
  shopItem: ShopItem
): ItemBalanceResult | null {
  let inventoryItem: GardenItem | null = null;
  const mockMoneySet = {
    inventory: [] as GardenItem[],
  };

  shopItem.onPurchase({ moneySet: mockMoneySet });

  inventoryItem = mockMoneySet.inventory[0] || null;

  if (
    !inventoryItem ||
    inventoryItem.type !== "gardenSeed" ||
    !inventoryItem.cropData
  ) {
    return null;
  }

  const { cropData, name, key } = inventoryItem;
  const { baseValue, growthTime, harvests } = cropData;
  const { price, rarity } = shopItem;

  const pricePerHarvest = price / harvests;
  const profitPerHarvest = baseValue - pricePerHarvest;
  const costEfficiency = profitPerHarvest / pricePerHarvest;
  const timeEfficiency = (profitPerHarvest * harvests) / growthTime;

  const scaleFactor = 1e6;
  const unitScaler = 1e6;
  const score =
    ((profitPerHarvest + costEfficiency + timeEfficiency * scaleFactor) /
      3 /
      unitScaler) *
    100;

  return {
    name,
    key,
    score: Number(score.toFixed(6)),
    price,
    baseValue,
    harvests,
    growthTime,
    pricePerHarvest: Number(pricePerHarvest.toFixed(2)),
    profitPerHarvest: Number(profitPerHarvest.toFixed(2)),
    timeEfficiency: Number(timeEfficiency.toFixed(8)),
    costEfficiency: Number(costEfficiency.toFixed(2)),
    rarity,
    stockChance: shopItem.stockChance,
    item: inventoryItem,
  };
}
