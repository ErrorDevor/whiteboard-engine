import { create } from "zustand";

export interface FrameSelection {
  selectedIds: Set<string>;
  isDragging: boolean;
  selectionRect: { x: number; y: number; width: number; height: number } | null;
  pointerButton?: number;
  isSelectBox: boolean;
  isDraggingFrame: boolean;
}

export type TextBlock = {
  x: number;
  y: number;
  text: string;
};

interface WhiteboardState {
  selection: FrameSelection;
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
  setSelectionDragging: (isDragging: boolean) => void;
  setSelectionBoxActive: (active: boolean) => void;
  setDraggingFrame: (dragging: boolean) => void;

  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;

  isPanning: boolean;
  setIsPanning: (p: boolean) => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  framePositions: Record<string, { x: number; y: number }>;
  setFramePosition: (id: string, pos: { x: number; y: number }) => void;
  getFramePosition: (id: string) => { x: number; y: number } | null;

  textBlocks: Record<string, TextBlock>;
  addTextBlock: (pos: { x: number; y: number }) => string;
  updateTextBlock: (
    id: string,
    data: { x?: number; y?: number; text?: string; isEmpty?: boolean }
  ) => void;

  removeTextBlock: (id: string) => void;
  getTextBlock: (id: string) => TextBlock | null;
  getAllTextBlocks: () => Record<string, TextBlock>;

  removeNoteBlock: (id: string) => void;
}

const loadSavedPan = (): { x: number; y: number } => {
  try {
    const saved = localStorage.getItem("whiteboardPan");
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  } catch {
    return { x: 0, y: 0 };
  }
};

const loadSavedZoom = (): number => {
  try {
    const saved = localStorage.getItem("whiteboardZoom");
    return saved ? JSON.parse(saved) : 1;
  } catch {
    return 1;
  }
};

const loadSavedFrames = (): Record<string, { x: number; y: number }> => {
  try {
    const saved = localStorage.getItem("framePositions");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const loadSavedTextBlocks = (): Record<string, TextBlock> => {
  try {
    const saved = localStorage.getItem("textBlocks");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const whiteboardState = create<WhiteboardState>((set, get) => ({
  selection: {
    selectedIds: new Set<string>(),
    isDragging: false,
    selectionRect: null,
    isSelectBox: false,
    isDraggingFrame: false,
  },

  isPanning: false,
  setIsPanning: (p: boolean) => set({ isPanning: p }),

  setSelectionDragging: (isDragging: boolean) =>
    set((state) => ({
      selection: { ...state.selection, isDragging },
    })),

  clearSelection: () =>
    set((state) => ({
      selection: { ...state.selection, selectedIds: new Set<string>() },
    })),

  setSelection: (ids: string[]) =>
    set((state) => ({
      selection: { ...state.selection, selectedIds: new Set<string>(ids) },
    })),

  setSelectionBoxActive: (active: boolean) =>
    set((state) => ({
      selection: { ...state.selection, isSelectBox: active },
    })),

  setDraggingFrame: (dragging: boolean) =>
    set((state) => ({
      selection: { ...state.selection, isDraggingFrame: dragging },
    })),

  pan: loadSavedPan(),
  setPan: (pan: { x: number; y: number }) => {
    localStorage.setItem("whiteboardPan", JSON.stringify(pan));
    set({ pan });
  },

  zoom: loadSavedZoom(),
  setZoom: (zoom: number) => {
    localStorage.setItem("whiteboardZoom", JSON.stringify(zoom));
    set({ zoom });
  },

  framePositions: loadSavedFrames(),
  setFramePosition: (id: string, pos: { x: number; y: number }) => {
    const updated = { ...get().framePositions, [id]: pos };
    localStorage.setItem("framePositions", JSON.stringify(updated));
    set({ framePositions: updated });
  },
  getFramePosition: (id: string) => get().framePositions[id] ?? null,

  // Text blocks
  textBlocks: loadSavedTextBlocks(),

  addTextBlock: (pos: { x: number; y: number }) => {
    const id = Date.now().toString();
    const newBlock: TextBlock = { x: pos.x, y: pos.y, text: "" };
    const updated = { ...get().textBlocks, [id]: newBlock };
    localStorage.setItem("textBlocks", JSON.stringify(updated));
    set({ textBlocks: updated });
    return id;
  },

  updateTextBlock: (id: string, data: Partial<TextBlock>) => {
    const blocks = get().textBlocks;
    if (!blocks[id]) return;
    const updated = {
      ...blocks,
      [id]: { ...blocks[id], ...data },
    };
    localStorage.setItem("textBlocks", JSON.stringify(updated));
    set({ textBlocks: updated });
  },

  removeTextBlock: (id: string) => {
    const blocks = { ...get().textBlocks };
    if (!(id in blocks)) return;
    delete blocks[id];
    localStorage.setItem("textBlocks", JSON.stringify(blocks));
    set({ textBlocks: blocks });
  },

  getTextBlock: (id: string) => get().textBlocks[id] ?? null,
  getAllTextBlocks: () => get().textBlocks,

  // Note blocks
  removeNoteBlock: (id: string) => {
    const blocks = { ...get().textBlocks };
    if (!(id in blocks)) return;
    delete blocks[id];
    localStorage.setItem("noteBlocks", JSON.stringify(blocks));
    set({ textBlocks: blocks });
  },
}));
