import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { UserContext } from "./context/UserContext";
import { useContext } from "react";

export default function BasicMenu() {
  const { favoritos } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <span className="material-icons-outlined text-white">folder</span>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {favoritos.length ? (
          favoritos.map((favorito, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <a
                target="_blank"
                className="flex items-center"
                href={favorito.url}
              >
                <img className="w-6 h-6 mr-1" src={favorito.logo} alt="/" />
                <span>{favorito.titulo}</span>
              </a>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>No hay favoritos</MenuItem>
        )}
      </Menu>
    </div>
  );
}
