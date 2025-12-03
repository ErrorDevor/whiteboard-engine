import { useEffect, useRef, useState } from "react";
import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from "@air/react-drag-to-select";
import _ from "lodash";

const ITEMS = [
  {
    id: 1,
    name: "John"
  },
  {
    id: 2,
    name: "Doe"
  },
  {
    id: 3,
    name: "Ash"
  },
  {
    id: 4,
    name: "Ketchum"
  },
  {
    id: 5,
    name: "Ketchum"
  },
  {
    id: 6,
    name: "Ketchum"
  },
  {
    id: 7,
    name: "Ketchum"
  },
  {
    id: 8,
    name: "Ketchum"
  },
  {
    id: 9,
    name: "Ketchum"
  },
  {
    id: 10,
    name: "Ketchum"
  },
  {
    id: 11,
    name: "Ketchum"
  },
  {
    id: 12,
    name: "Ketchum"
  },
  {
    id: 13,
    name: "Ketchum"
  },
  {
    id: 14,
    name: "Ketchum"
  },
  {
    id: 15,
    name: "Ketchum"
  },
  {
    id: 16,
    name: "Ketchum"
  },
  {
    id: 17,
    name: "Ketchum"
  },
  {
    id: 18,
    name: "Ketchum"
  },
  {
    id: 19,
    name: "Ketchum"
  },
  {
    id: 20,
    name: "Ketchum"
  },
  {
    id: 21,
    name: "Ketchum"
  },
  {
    id: 22,
    name: "Ketchum"
  }
];

const App = () => {
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const selectableItems = useRef<any[]>([]);
  const elementsContainerRef = useRef<HTMLDivElement | null>(null);

  const { DragSelection } = useSelectionContainer({
    eventsElement: document.getElementById("root"),
    onSelectionChange: (box) => {
      /**
       * Here we make sure to adjust the box's left and top with the scroll position of the window
       * @see https://github.com/AirLabsTeam/react-drag-to-select/#scrolling
       */
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      };

      const itemsToSelect: any[] = [];
      selectableItems.current.forEach((item, index) => {
        if (boxesIntersect(scrollAwareBox, item)) {
          itemsToSelect.push(ITEMS[index]);
        }
      });
      setSelectedItems(itemsToSelect);
    },
    onSelectionStart: () => {},
    onSelectionEnd: () => {},
    selectionProps: {
      style: {
        border: "2px dashed purple",
        borderRadius: 4,
        backgroundColor: "brown",
        opacity: 0.5
      }
    },
    isEnabled: true
  });

  const normalClickHandler = (item: any) => {
    let clonedItems = _.cloneDeep(selectedItems);
    const foundItem = clonedItems.find((i: any) => i.id === item.id);
    let newItem = [];
    if (foundItem) {
      if (clonedItems.length > 1) {
        newItem.push(item);
      }
    } else {
      newItem.push(item);
    }
    setSelectedItems(newItem);
  };

  const ctrlClickHandler = (item: any) => {
    let clonedItems = _.cloneDeep(selectedItems);
    const foundItem = clonedItems.find((i: any) => i.id === item.id);
    if (foundItem) {
      // remove Item
      clonedItems = clonedItems.filter((i: any) => i.id !== item.id);
    } else {
      clonedItems.push(item);
    }
    setSelectedItems(clonedItems);
  };

  const toggleMultiSelectHandler = (e: any) => {
    e.stopPropagation();
    setIsMultiSelect((prevState) => {
      alert(`MultiSelect ${!prevState}`);
      return !prevState;
    });
  };

  useEffect(() => {
    if (elementsContainerRef.current) {
      const arr: any = [];
      Array.from(elementsContainerRef.current.children).forEach((item) => {
        const { left, top, width, height } = item.getBoundingClientRect();
        arr.push({
          left,
          top,
          width,
          height
        });
      });
      selectableItems.current = arr;
    }
  }, []);

  const singleItemClickHandler = (item: any) => {
    if (isMultiSelect) {
      ctrlClickHandler(item);
    }
    // ctrl key was held down during click
    else if (window.event.ctrlKey) {
      ctrlClickHandler(item);
    }
    // normal click
    else {
      normalClickHandler(item);
    }
  };

  return (
    <div className="container">
      <DragSelection />
      <div
        id="elements-container"
        className="elements-container"
        ref={elementsContainerRef}
      >
        {ITEMS.map((item, index) => (
          <div
            key={index}
            style={{ position: "relative" }}
            className={`element ${
              selectedItems.some((i: any) => i.id === item.id) ? "selected" : ""
            }`}
            onClick={() => singleItemClickHandler(item)}
          >
            <div
              onClick={toggleMultiSelectHandler}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                display: "inline-block",
                padding: "5px",
                position: "absolute"
              }}
            >
              tap
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
