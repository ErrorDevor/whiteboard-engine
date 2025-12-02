import { create } from "zustand";

interface UiState {
  selectedId: string | null;
  setSelectedId: (value: string | null) => void;

  activeTool: number; 
  setActiveTool: (index: number) => void;

  isAddingText: boolean;          
  setIsAddingText: (value: boolean) => void;

  isAddingNote: boolean;          
  setIsAddingNote: (value: boolean) => void;
}

export const useUiState = create<UiState>((set) => ({
  selectedId: null,
  setSelectedId: (value) => set({ selectedId: value }),

  activeTool: 0,
  setActiveTool: (index) => set({ activeTool: index }),

  isAddingText: false,
  setIsAddingText: (value) => set({ isAddingText: value }),

  isAddingNote: false,
  setIsAddingNote: (value) => set({ isAddingNote: value }),
}));
