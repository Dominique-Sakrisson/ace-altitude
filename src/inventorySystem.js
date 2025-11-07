import { ItemLibrary, defaultItemLibrary } from "./itemLibrary";export class InventorySystem {
  constructor(rows = 3, cols = 3, itemLibrary = defaultItemLibrary) {
    this.itemLibrary = itemLibrary;
    this.rows = rows;
    this.cols = cols;
    this.slotConfig = { id: 0, stack: 0 };
    this.slots = Array.from(
      { length: rows },
      () => Array.from({ length: cols }, () => null), // null = empty
    );
  }
  getItem(id) {
    const item = this.itemLibrary.getItem(id);
    if (!item) return false;
    return item;
  }
  getItemByCategory(category) {
    for (const [key, value] of this.itemLibrary.items.entries()) {
      if (value.category === category) {
        return value; // or return [key, value] if you need both
      }
    }
    return undefined;
  }
  // Check if item fits at a given position
  canPlaceItem(id, row, col) {
    const item = this.getItem(id);
    if (!item) return false;

    for (let r = 0; r < item.size.h; r++) {
      for (let c = 0; c < item.size.w; c++) {
        if (
          row + r >= this.rows ||
          col + c >= this.cols ||
          this.slots[row + r][col + c] !== null
        ) {
          return false; // out of bounds or blocked
        }
      }
    }
    return true;
  }

  // Place an item if possible
  addToInventory(item, stack, row, col) {
    // const item = this.itemLibrary.getItem(id);
    if (!item) return false;
    if (row > this.rows || col > this.cols) return { quit: true };

    if (!this.canPlaceItem(item.id, row, col)) {
      if(!this.canPlaceItem(item.id, row +1, col +1)){
        console.warn("Item doesn't fit here");
        return false;

      }
    }

    // Place the anchor at top-left
    this.slots[row][col] = { id: item.id, stack, anchor: true };

    // Mark the rest as occupied
    for (let r = 0; r < item.size.h; r++) {
      for (let c = 0; c < item.size.w; c++) {
        if (r === 0 && c === 0) continue;
        this.slots[row + r][col + c] = { id: item.id, occupied: true };
      }
    }
    console.log(
      "%c✔ Success:",
      "color: green; font-weight: bold;",
      "Item Added",
    );
    return true;
  }

  // Remove item by anchor
  removeItem(row, col) {
    const slot = this.slots[row][col];
    if (!slot || !slot.anchor) return false;

    const item = this.itemLibrary.getItem(slot.id);

    for (let r = 0; r < item.size.h; r++) {
      for (let c = 0; c < item.size.w; c++) {
        this.slots[row + r][col + c] = null;
      }
    }
    return true;
  }

  printInventory() {
    const inventory = this.slots.map((row) =>
      row.map((slot) =>
        slot === null ? "empty" : slot.anchor ? `id:${slot.id}` : "occupied",
      ),
    );
    console.table(inventory);
    return inventory;
  }
}
