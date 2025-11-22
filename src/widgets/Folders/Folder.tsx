"use client";

import React, { useState } from "react";

import clsx from "clsx";
import Image from "@/shared/ui/base/Image";
import { Dropdown } from "@/widgets/Dropdown/Dropdown";
import { Button } from "@/shared/ui/ui-kit/Button/Button";
import { mockData } from "@/shared/data/mockData";

import css from "./Folders.module.scss";

interface FoldersProps {
  className?: string;
  folderName?: string;
}

export const Folders: React.FC<FoldersProps> = ({ className, folderName }) => {
  const dropdownArray = mockData.dropdownArray;
  const userFoldersArray = mockData.userFoldersArray;

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setSubDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((v) => !v);
  const closeDropdown = () => {
    setDropdownOpen(false);
    setSubDropdownOpen(false);
  };

  const handleItemClick = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();

    if (itemName === "Add to Folder") {
      setSubDropdownOpen((v) => !v);
    } else {
      setSubDropdownOpen(false);
    }
  };

  return (
    <div className={clsx(css.folders, className)}>
      <div className={css.folders_name}>
        <p>{folderName}</p>
      </div>

      <div
        className={clsx(css.dropdown_wrapper, isDropdownOpen && css.open)}
        onClick={toggleDropdown}
      >
        <Image.Default src="/icons/arrow-down.svg" className={css.arrow_icon} />
      </div>

      <Dropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        className={css.main_dropdown}
      >
        <ol className={css.dropdown_content}>
          {dropdownArray.map((item) => (
            <li
              key={item.id}
              className={css.dropdown_item}
              onClick={(e) => handleItemClick(e, item.name)}
            >
              <span>{item.name}</span>
              {item.icon && (
                <Image.Default src={item.icon} className={css.item_icon} />
              )}
            </li>
          ))}
        </ol>
      </Dropdown>

      <Dropdown
        isOpen={isSubDropdownOpen}
        onClose={() => setSubDropdownOpen(false)}
        className={css.sub_dropdown}
      >
        <div className={css.submenu_header}>My Folder</div>

        <div className={css.submenu_list}>
          {userFoldersArray.map((folder) => (
            <div key={folder.id} className={css.submenu_item}>
              <div className={css.submenu_item_left}>
                <Image.Default
                  src="/icons/folder-add-dropdown.svg"
                  className={css.folder_icon}
                />
                <span>{folder.name}</span>
              </div>
              <span className={css.folder_count}>{folder.count}</span>
            </div>
          ))}
        </div>

        <div className={css.submenu_footer}>
          <Button className={css.new_folder_button}>
            <Image.Default src="/icons/plus.svg" className={css.plus_icon} />
            New Folder
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};
