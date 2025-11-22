"use client";

import React, { useEffect, useRef, useState } from "react";

import clsx from "clsx";

import css from "./Dropdown.module.scss";

interface DropdownProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  className,
  children,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);

      openTimeout.current = setTimeout(() => setVisible(true), 40);
    } else {
      setVisible(false);

      closeTimeout.current = setTimeout(() => {
        setMounted(false);
      }, 410);
    }

    return () => {
      if (openTimeout.current) clearTimeout(openTimeout.current);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={clsx(css.dropdown, className, visible && css.show_dropdown)}
      ref={dropdownRef}
    >
      {children}
    </div>
  );
};
