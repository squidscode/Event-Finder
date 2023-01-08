import './popup.css';
import React from 'react';

function getValue(id){
    const element = document.getElementById(id);
    return element.value;
}

function FriendModal(props){
    // console.log(props);

    return (
        <div className="form-popup middle" id="planForm">
            <div className="form-container">
            <h1 class="center">Add/Remove Friends</h1>
                <button className="hide-button" onClick={() => {props.close()}}>&times;</button>

                <label for="friend_requests"><b>Pending Friend Requests:</b></label>
                <FriendRequestsDisplay friend_obj={props.friend_obj} />

                <label for="title"><b>Username</b></label>
                <input type="text" placeholder="Enter Username" name="title" id="friend_username" required />

                <button className="btn" onClick={() => {
                    props.add_friend({
                        username: getValue('friend_username')
                        });
                }}>Add Friend</button>
                <button className="btn" onClick={() => {
                    props.remove_friend({
                        username: getValue('friend_username')
                        });
                }}>Remove Friend</button>
            </div>
        </div>
    );
}

function FriendRequestsDisplay(props){
    let friends = props.friend_obj.friends.map((username) => '"' + username + '"');
    let friend_requests = props.friend_obj.friend_requests.map((username) => '"' + username + '"');

    return (
        <div>
            <div style={{width: "50%"}}>
                <p>Friends: {friends.join()}</p>
            </div>
            <div style={{width: "50%"}}>
                <p>Friend Requests: {friend_requests.join()}</p>
            </div>

        </div>);
}

export default FriendModal;