import { FontSystem } from "cassidy-styler";
import {
  ArmorInventoryItem,
  InventoryItem,
  WeaponInventoryItem,
} from "./cassidyUser";
import { Inventory } from "@cass-modules/InventoryEnhanced";
import { GearData, GearsManage, PetPlayer } from "@cass-plugins/pet-fight";

export const smartSpectra = `🎓 ${FontSystem.fonts.bold_italic(
  "SMART"
)}${FontSystem.fonts.fancy_italic("Spectra")}`;

export namespace SmartPet {
  export function convertHealToSaturationRange(
    heal: number | unknown
  ): [number, number] {
    const sat1 = (Number(heal) || 0) * 1.2 * 60 * 1000;

    const satMin = Math.floor(sat1 * 0.25);
    const satMax = Math.floor(sat1 * 1);

    return [satMin, satMax];
  }

  export function getFoodPts<I extends InventoryItem>(item: I) {
    if (typeof item.heal === "number") {
      const satus = convertHealToSaturationRange(item.heal);
      if (satus.some((i) => isNaN(i))) {
        return 0;
      }
      return (satus[0] + satus[1]) * 0.2;
    }
    if (typeof item.saturation === "number") {
      return item.saturation;
    }
    return 0;
  }

  export function findHungryPets<I extends InventoryItem>(pets: Inventory<I>) {
    return Array.from(pets).sort((petA, petB) => {
      const {
        lastFeed: lastFeedA = Date.now(),
        lastSaturation: lastSaturationA = 0,
      } = petA;
      const {
        lastFeed: lastFeedB = Date.now(),
        lastSaturation: lastSaturationB = 0,
      } = petB;

      const timeSinceLastFeedA = Date.now() - Number(lastFeedA);
      const timeSinceLastFeedB = Date.now() - Number(lastFeedB);

      const hungerLevelA = timeSinceLastFeedA - Number(lastSaturationA);
      const hungerLevelB = timeSinceLastFeedB - Number(lastSaturationB);

      return hungerLevelB - hungerLevelA;
    });
  }

  export function isFeedable<P extends InventoryItem, F extends InventoryItem>(
    pet: P,
    food: F
  ): boolean {
    return (
      food.type === `${pet.petType}_food` ||
      food.type === "anypet_food" ||
      food.type === "food"
    );
  }

  export function findFoods<P extends InventoryItem, I extends InventoryItem>(
    pet: P,
    inv: Inventory<I>
  ) {
    const sorted = Array.from(inv)
      .filter((i) => isFeedable(pet, i))
      .toSorted((a, b) => getFoodPts(b) - getFoodPts(a));
    return sorted;
  }

  export function findFood<P extends InventoryItem, I extends InventoryItem>(
    pet: P,
    inv: Inventory<I>
  ) {
    return findFoods(pet, inv)[0];
  }

  export function findHungryFeedable<
    P extends InventoryItem,
    I extends InventoryItem
  >(pets: Inventory<P>, inv: Inventory<I>) {
    const hungryPets = findHungryPets(pets);

    const sortedHungryPetsWithFood = hungryPets.map((pet) => {
      const suitableFood = findFood(pet, inv);
      return { pet, food: suitableFood };
    });

    const sortedResult = sortedHungryPetsWithFood.sort((a, b) => {
      const hungerDifference =
        Date.now() -
        Number(a.pet.lastFeed) -
        Number(a.pet.lastSaturation) -
        (Date.now() - Number(b.pet.lastFeed) - Number(b.pet.lastSaturation));

      if (hungerDifference !== 0) {
        return hungerDifference;
      }

      return getFoodPts(b.food) - getFoodPts(a.food);
    });

    return sortedResult;
  }

  export function calculateAddedStat<
    P extends UserData["petsData"],
    E extends ArmorInventoryItem | WeaponInventoryItem,
    G extends UserData["gearsData"]
  >(pets: P, gears: G, item: E) {
    const gearsManage = new GearsManage(gears);
    const playersBefore = pets.map(
      (i) => new PetPlayer(i, gearsManage.getGearData(i.key))
    );
    const playersAfter = pets.map(
      (i) => new PetPlayer(i, gearsManage.getGearData(i.key))
    );

    for (const player of playersAfter) {
      const gear = player.gearInstance();
      if (item.type === "weapon") {
        gear.equipWeapon(item);
      } else if (item.type === "armor") {
        let ind = !gear.armors[1] && gear.armors[0] ? 1 : 0;
        const exi1 = gear.armors[0];
        const exi2 = gear.armors[1];
        if (exi2.def > exi1.def) {
          ind = 0;
        } else if (exi1.def > exi2.def) {
          ind = 1;
        }
        gear.equipArmor(ind, item);
      }
    }
  }
}
