import { AppBar, Toolbar, Typography } from "@mui/material";

function Navbar() {
  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Flex Living Reviews Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
