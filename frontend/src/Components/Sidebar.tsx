import { Drawer, List, ListItem, ListItemButton, Divider } from '@mui/material';

export default function Sidebar() {
  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        {['Home', 'Personal Details', 'Employment & Income', 'Mortgage Loan Details'].map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton selected={item === 'Employment & Income'}>{item}</ListItemButton>
          </ListItem>
        ))}
        <Divider />
        {['Online Access Agreement', 'Privacy Policies', 'Contact Us', 'Make an Appointment'].map(
          (item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton>{item}</ListItemButton>
            </ListItem>
          )
        )}
      </List>
    </Drawer>
  );
}
