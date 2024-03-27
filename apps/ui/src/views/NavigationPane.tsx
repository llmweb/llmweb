import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';


export default function NavigationPane({chartsInfo, selectedChart}) {
    const redirectPage = (url)=>{
        window.location.href = url
    }

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
        {chartsInfo.map((info, index) => (
            <span key={index}>
                <ListItemButton
                selected={info.uri === selectedChart.uri}
                onClick={()=>{redirectPage('#/'+info.uri)}}>
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
                                    {info.name}
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
            </span>
        ))}
    </List>
    </>
  );
}
