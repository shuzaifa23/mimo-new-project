"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FileContextType {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileContext = createContext<FileContextType>({
  file: null,
  setFile: () => {},
});

export function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileContext.Provider value={{ file, setFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useGlobalFile() {
  return useContext(FileContext);
}
