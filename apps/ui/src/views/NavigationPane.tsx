import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

export default function AlignItemsList() {
   
   let navigationPaneInfo = [
        {
            heading: "Team Creation",
            description: "To create a team consisting of a developer and a tester for a particular requirement."
        },
        {
            heading: "Code Completion",
            description: "Completes the code from where you are stuck"
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
            {navigationPaneInfo.map((info) => (
                <>
                <ListItem alignItems="flex-start">
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
                <Divider variant="middle" component="li" />
                </>
            ))}
        </>
    </List>
    </>
  );
}
