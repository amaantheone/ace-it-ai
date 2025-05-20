// Helper functions for FlashCardSidebar logic
// Move all non-JSX logic here from flashcard-sidebar.tsx

import { useEffect } from "react";

// Define types for FlashCardData and Folder
export interface FlashCardData {
  id: string;
  term: string;
  translation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string;
  tag?: string | null;
  folderId?: string;
}
export interface Folder {
  id: string;
  name: string;
  cardIds: string[];
}

// Fetch flashcards and folders
export const useFlashCardData = (
  setFlashCards: (cards: FlashCardData[]) => void,
  setFolders: (folders: Folder[]) => void,
  setError: (err: string) => void,
  setCurrentId: (id: string | null) => void
) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cardsResponse = await fetch("/api/flashcard");
        if (!cardsResponse.ok) {
          const errorData = await cardsResponse.json();
          throw new Error(errorData.error || "Failed to fetch flash cards");
        }
        const cardsData = await cardsResponse.json();
        // Map all cards to ensure null for missing fields
        setFlashCards(
          (cardsData.flashCards as Partial<FlashCardData>[]).map((card) => ({
            ...card,
            translation: card.translation ?? null,
            partOfSpeech: card.partOfSpeech ?? null,
            definition: card.definition ?? "",
            example: card.example ?? "",
            tag: card.tag ?? null,
          }) as FlashCardData)
        );
        const foldersResponse = await fetch("/api/flashcard/folder");
        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          setFolders(foldersData.folders as Folder[]);
        }
        const urlParams = new URLSearchParams(window.location.search);
        setCurrentId(urlParams.get("id"));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load flash cards"
        );
      }
    };
    fetchData();
  }, [setFlashCards, setFolders, setError, setCurrentId]);
};

// Get cards not in any folder
// Accepts flashCards with id: string | undefined, but only returns those with id: string
export const getStandaloneCards = (
  folders: { cardIds?: string[] }[],
  flashCards: { id?: string }[]
): { id: string }[] => {
  const allFolderCardIds = folders.flatMap((folder) =>
    Array.isArray(folder.cardIds) ? folder.cardIds : []
  );
  // Only return cards with a defined string id
  return flashCards.filter(
    (card): card is { id: string } =>
      typeof card.id === "string" && !allFolderCardIds.includes(card.id)
  );
};

// Drag and drop helpers
// Use a symbol to store the drag icon on the window object to avoid TS errors
const DRAG_ICON_KEY = "__flashcard_drag_icon__";

type SetDraggedCardId = (id: string | null) => void;
export const handleDragStart = (
  setDraggedCardId: SetDraggedCardId,
  cardId: string,
  cardTerm: string
): HTMLDivElement => {
  setDraggedCardId(cardId);
  const dragIcon = document.createElement("div");
  dragIcon.style.display = "flex";
  dragIcon.style.alignItems = "center";
  dragIcon.style.padding = "4px 8px";
  dragIcon.style.background = "#222";
  dragIcon.style.color = "#fff";
  dragIcon.style.borderRadius = "6px";
  dragIcon.style.fontSize = "14px";
  dragIcon.style.fontWeight = "bold";
  dragIcon.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  dragIcon.style.position = "absolute"; // Prevent it from affecting layout
  dragIcon.style.pointerEvents = "none"; // Prevent interaction
  dragIcon.style.zIndex = "9999"; // Ensure it's on top
  dragIcon.style.left = "-9999px"; // Move off-screen
  dragIcon.innerHTML = `<svg width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='margin-right:6px;vertical-align:middle;' viewBox='0 0 24 24'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/></svg>${cardTerm}`;
  document.body.appendChild(dragIcon);
  // Use window as unknown as Record<string, unknown> to avoid TS error
  (window as unknown as Record<string, unknown>)[DRAG_ICON_KEY] = dragIcon;
  return dragIcon;
};

export const handleDragEnd = (setDraggedCardId: SetDraggedCardId) => {
  setDraggedCardId(null);
  const dragIcon = (window as unknown as Record<string, unknown>)[
    DRAG_ICON_KEY
  ] as HTMLDivElement | undefined;
  if (dragIcon) {
    document.body.removeChild(dragIcon);
    (window as unknown as Record<string, unknown>)[DRAG_ICON_KEY] = null;
  }
};

// ...add more helpers as needed (handleDropOnFolder, etc.)
