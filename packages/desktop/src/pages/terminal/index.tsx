import { AddSharp, SearchSharp } from "@mui/icons-material";
import { Button, Fab, InputAdornment, TextField } from "@mui/material";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useRef, useState } from "react";

import CellTowerSharpIcon from "@mui/icons-material/CellTowerSharp";
import IconButton from "../../components/Button/IconButton/index";
import NirvanaHeader from "../../components/header";

export default function NirvanaTerminal() {
  return (
    <div className="flex flex-col flex-1">
      <NirvanaHeader />

      {/* main terminal content */}
      <div className="m-2">
        {/* header */}
        <div className="flex flex-row items-center">
          <span className="flex flex-row gap-2 justify-start text-slate-800">
            <CellTowerSharpIcon />

            <h2 className="text-inherit font-semibold ">Tuned In</h2>

            <p className="text-slate-300 text-xs">3/5</p>
          </span>
          <IconButton>
            <FaPlus />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
