import React from 'react';
import Login from './Apps/login';
import {Navbar} from './Apps/navbar';
import PlanModal from './Apps/plan_modal';
import 'bootstrap';
import {send, encodeBasicUserPassword} from './BackendAPI/api';
import {map_update} from './map_update';
import FriendModal from './Apps/add_friend_modal';


export const MapDisplayTypes = {
    MY_PLANS: "MY_PLANS",
    FRIEND_PLANS: "FRIEND_PLANS",
    // GROUP_PLANS: "GROUP_PLANS",
    PUBLIC_PLANS: "PUBLIC_PLANS"
};

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            logged_in: false,
            create_plan: false,
            friend_modal: false,
            friend_obj: {friends: [], friend_requests: []},
            display_type: MapDisplayTypes.PUBLIC_PLANS, // default
            user_info: {username: null, password: null, auth_str: null},
            current_plan: {lat: 0, lng: 0}
        };
        this.handleClick = this.handleClick.bind(this);
        this.login = this.login.bind(this);
        this.handlePlanSubmit = this.handlePlanSubmit.bind(this);
        this.updateMap = this.updateMap.bind(this);
        this.changeMapDisplay = this.changeMapDisplay.bind(this);
        this.get_friends = this.get_friends.bind(this);

        this.updateMap(this.state.display_type);
    }

    changeMapDisplay(display_type){
        if(MapDisplayTypes[display_type] === undefined){
            // console.log("ERROR");
            return;
        }

        this.setState({...this.state, 'display_type': display_type});
        this.updateMap(display_type);
    }

    updateMap(dt){
        if(dt === MapDisplayTypes.MY_PLANS){
            if(!this.state.logged_in) return;
            const username = this.state.user_info.username;
            const auth_str = this.state.user_info.auth_str;

            send('GET', '/' + username + '/plans/1', [['Authorization', auth_str]], {}, (status, body) => {
                if(status !== 200){
                    let msg = body.message;
                    window.alert("[" + status + " ERROR] " + msg);
                    return;
                }

                map_update(body);
            });
        }else if(dt === MapDisplayTypes.FRIEND_PLANS){
            if(!this.state.logged_in) return;
            const username = this.state.user_info.username;
            const auth_str = this.state.user_info.auth_str;

            send('GET', '/' + username + '/friend-plans', [['Authorization', auth_str]], {}, (status, body) => {
                if(status !== 200){
                    let msg = body;
                    if(msg.message !== undefined) msg = msg.message;
                    window.alert("[" + status + " ERROR] " + msg);
                    return;
                }

                map_update(body);
            });
        // }else if(dt === MapDisplayTypes.GROUP_PLANS){ NOT IMPLEMENTED
        }else if(dt === MapDisplayTypes.PUBLIC_PLANS){
            send('GET', '/plans', [], {}, (status, body) => {
                if(status !== 200){
                    let msg = body;
                    if(msg.message !== undefined) msg = msg.message;
                    window.alert("[" + status + " ERROR] " + msg);
                    return;
                }

                map_update(body);
            });
        }
    }

    handleClick(element){
        const latlng = JSON.parse(document.getElementById('map-click').innerHTML);
        // console.log(latlng);
        this.setState({...this.state, create_plan: true,
            current_plan: {lat: latlng.lat, lng: latlng.lng}});
    }

    login(username, password){
        const click_ele = document.getElementById('map-click');
        this.setState({...this.state, logged_in: true, 
            user_info: {'username': username, 'password': password, 'auth_str': encodeBasicUserPassword(username, password)}});
        this.get_friends_with_auth(username, encodeBasicUserPassword(username, password));

        click_ele.addEventListener('click', this.handleClick);
    }

    logout(){
        const click_ele = document.getElementById('map-click');
        this.setState({...this.state, logged_in: false, display_type: MapDisplayTypes.PUBLIC_PLANS});
        this.updateMap(MapDisplayTypes.PUBLIC_PLANS);

        click_ele.removeEventListener('click', this.handleClick);
    }

    handlePlanSubmit(plan_obj){
        // console.log(plan_obj);
        const username = this.state.user_info.username;
        const auth_str = this.state.user_info.auth_str;
        send('POST', '/' + username + '/plans', [["Authorization", auth_str]], plan_obj, (status, body) => {
            if(status !== 200){
                var msg = body.message;
                window.alert("[" + status + " ERROR] " + msg);
            }else{
                this.setState({...this.state, create_plan: false});
            }
        });
    }

    add_friend(user_obj){
        const username = this.state.user_info.username;
        const auth_str = this.state.user_info.auth_str;
        send('POST', '/' + username + '/friend', [["Authorization", auth_str]], user_obj, (status, body) => {
            if(status !== 200){
                var msg = body.message;
                window.alert("Error! " + msg);
            }else{
                this.setState({...this.state, friend_modal: false});
            }
            this.get_friends();
        });
    }

    remove_friend(user_obj){
        const username = this.state.user_info.username;
        const auth_str = this.state.user_info.auth_str;
        send('DELETE', '/' + username + '/friend', [["Authorization", auth_str]], user_obj, (status, body) => {
            if(status !== 200){
                var msg = body.message;
                window.alert("Error! " + msg);
                // console.log(body);
            }else{
                this.setState({...this.state, friend_modal: false});
            }
            this.get_friends();
        });
    }

    get_friends_with_auth(username, auth_str){
        send('GET', '/' + username + '/friend', [["Authorization", auth_str]], {}, (status, body) => {
            if(status !== 200){
                var msg = body.message;
                window.alert("[" + status + " ERROR] " + msg);
                this.setState({...this.state, friend_obj: {friends: [], friend_requests: []}});
            }else{
                this.setState({...this.state, friend_obj: body}); 
            }
        });
    }

    get_friends(){
        const username = this.state.user_info.username;
        const auth_str = this.state.user_info.auth_str;
        send('GET', '/' + username + '/friend', [["Authorization", auth_str]], {}, (status, body) => {
            if(status !== 200){
                var msg = body.message;
                window.alert("[" + status + " ERROR] " + msg);
                this.setState({...this.state, friend_obj: {friends: [], friend_requests: []}});
            }else{
                this.setState({...this.state, friend_obj: body}); 
            }
        });
    }

    render(){
        let navbar = <Navbar changeMapDisplay={this.changeMapDisplay}
            display={this.state.display_type} showFriendDisplay={() => {this.setState({...this.state, friend_modal: true})}}/>;
        let logout = <LogoutButton logout={() => {this.logout()}} />;

        if(this.state.logged_in === true && this.state.friend_modal === true) {
            return (
                <>
                    {navbar}
                    <FriendModal add_friend={(user_obj) => this.add_friend(user_obj)} remove_friend={(user_obj) => this.remove_friend(user_obj)}
                        friend_obj={this.state.friend_obj} close={() => {this.setState({...this.state, friend_modal: false})}}/>
                    {logout}
                </>
            );
        }


        if(this.state.logged_in === true && this.state.create_plan === true){
            return (
                <>
                    {navbar}
                    <PlanModal close={() => {this.setState({...this.state, create_plan: false})}} 
                        lat={this.state.current_plan.lat} lng={this.state.current_plan.lng}
                        submit={this.handlePlanSubmit} />
                    {logout}
                </>
            );
        }

        if(this.state.logged_in === true){
            return (
                <>
                    {navbar}
                    {logout}
                </>
            );
        }

        return (
            <>
                <Login isLoggedIn={this.state.logged_in} 
                    login={this.login} />
            </>
        );
    }
}

function LogoutButton(props){
    return (
        <div className="form-popup bottom-right" id="myForm">
            <div className="form-container">
                <button className="logout-button" onClick={() => {props.logout()}}>[Logout]</button>
            </div>
        </div>
    );
}

export default App;