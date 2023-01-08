import './navbar.css';
import React from 'react';
import {MapDisplayTypes} from '../app';

function ifEqActive(str1, str2){
    if(str1 === str2) return "active";
    return "";
}

class Navbar extends React.Component {
    render(){
        // console.log(this.props);

        return (
            <ul className="nav-ul">
                <NavbarButtons changeMapDisplay={this.props.changeMapDisplay} 
                    display={this.props.display} showFriendDisplay={this.props.showFriendDisplay} />
            </ul>
        )    
    }
}

function NavbarButtons(props){
    const navbar = [];
    const display = props.display;
    // console.log(props);

    navbar.push(<li key="0" className="nav-li left"><button className={ifEqActive(display, MapDisplayTypes.MY_PLANS)}
        onClick={() => props.changeMapDisplay(MapDisplayTypes.MY_PLANS)}>My Plans</button></li>);
    navbar.push(<li key="1" className="nav-li left"><button className={ifEqActive(display, MapDisplayTypes.FRIEND_PLANS)}
        onClick={() => props.changeMapDisplay(MapDisplayTypes.FRIEND_PLANS)}>Friend Plans</button></li>);
    // navbar.push(<li key="2" className="nav-li left"><button className={ifEqActive(display, MapDisplayTypes.GROUP_PLANS)}
    //     onClick={() => props.changeMapDisplay(MapDisplayTypes.GROUP_PLANS)}>Group Plans</button></li>);
    navbar.push(<li key="3" className="nav-li left"><button className={ifEqActive(display, MapDisplayTypes.PUBLIC_PLANS)} 
        onClick={() => props.changeMapDisplay(MapDisplayTypes.PUBLIC_PLANS)}>Public Plans</button></li>);
    
    // navbar.push(<li key="4" className="nav-li right"><button>Account</button></li>); // NOT IMPLEMENTED
    navbar.push(<li key="5" className="nav-li right"><button onClick={() => {props.showFriendDisplay()}}>Add Friend</button></li>);
    

    return navbar;
}


export {Navbar};