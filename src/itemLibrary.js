const DEFAULT_SIZE = { w: 1, h: 1 };
export class ItemLibrary {
  constructor() {
    this.items = new Map([
      [
        0,
        {
          id: 0,
          name: "Empty",
          category: "none",
          size: DEFAULT_SIZE,
          stackAble: false,
          salvage: false,
        },
      ],
      [
        1,
        {
          id: 1,
          name: "rock",
          category: "alphaStone",
          size: { w: 1, h: 1 },
          stackAble: false,
          salvage: true,
          src: "../public/boulder.png",
        },
      ],
      [
        2,
        {
          id: 2,
          name: "debris",
          category: "baseStone",
          size: DEFAULT_SIZE,
          stackAble: true,
          salvage: false,
        },
      ],
    ]);
  }
  getItem(id) {
    return this.items.get(id) || null;
  }
  getItemByCategory(category){
    const item = this.items

  }
}

export const defaultItemLibrary = new ItemLibrary();
