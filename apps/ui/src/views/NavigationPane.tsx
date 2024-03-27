import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import ListItemIcon from '@mui/material/ListItemIcon';


export default function AlignItemsList() {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    let navigationPaneInfo = [
        {
            heading: "Team Creation",
            description: "To create a team consisting of a developer and a tester.",
            icon: <GroupIcon/>,
            selected: true
        },
        {
            heading: "Code Completion",
            description: "Completes the code from where you are stuck.",
            icon: <CodeIcon/>,
            selected: false
        }
    ] 

  return (
    <>
    <Typography
        sx={{ display: 'flex', fontWeight: 'bold', justifyContent: 'center'}}
        component="span"
        variant="h6"
        color="paper">
            LLM Web
    </Typography>

    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        <>
            {navigationPaneInfo.map((info, index) => (
                <>
                    <ListItemButton
                    selected={selectedIndex === index}
                    onClick={()=>{setSelectedIndex(index)}}>
                        <ListItem alignItems="flex-start">
                            <ListItemIcon>
                                {info.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={                      
                                <React.Fragment>
                                    <Typography
                                        sx={{ display: 'block', fontWeight: 'bold'}}
                                        component="span"
                                        variant="body2"
                                        color="text.primary">
                                        {info.heading}
                                    </Typography>
                                </React.Fragment>}
                                secondary={
                                <React.Fragment>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.secondary">
                                        {info.description}
                                    </Typography>
                                </React.Fragment>
                            }/>
                        </ListItem>
                    </ListItemButton>
                    <Divider variant="middle" component="li" />
                </>
            ))}
        </>
    </List>
    </>
  );
}
