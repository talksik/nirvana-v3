import { AddSharp, SearchSharp } from "@mui/icons-material";
import { Button, Fab, InputAdornment, TextField } from "@mui/material";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useRef, useState } from "react";

import IconButton from "../../components/Button/IconButton/index";
import NirvanaHeader from "../../components/header";

export default function NirvanaTerminal() {
  return (
    <div className="flex flex-col flex-1">
      <NirvanaHeader />

      <div className="flex flex-row items-stretch m-2 gap-2">
        <IconButton>
          <FaPlus />
        </IconButton>
      </div>
    </div>
  );
}
