import {
  Button,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
} from "@mui/material";

import { Search } from "@mui/icons-material";

export default function NewConvo() {
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-row w-full">
        <Button size="small">back</Button>

        <TextField
          autoFocus
          color="secondary"
          label="Search by name or email"
          variant="filled"
          fullWidth
        />
      </div>
    </div>
  );
}
