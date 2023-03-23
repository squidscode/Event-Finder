import React from 'react';
import './popup.css';
import {send, encodeBasicUserPassword} from '../BackendAPI/api';

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            hide: false,
            formType: "Login",
            errorMsg: ""
        }
    }

    otherFormType(){
        return this.state.formType === "Login" ? "Sign Up" : "Login";
    }

    login(username, password){
        send('GET', '/accounts', [['Authorization', encodeBasicUserPassword(username, password)]], {},
            (status, body) => {
                if(status === 401){
                    this.setState({...this.state, errorMsg: "Invalid username/password."});
                }else{
                    this.setState({...this.state, hide: true, errorMsg: ""});
                    this.loggedIn(username, password);
                }
        });
    }

    loggedIn(username, password){
        this.props.login(username, password);
    }

    loggedOut(){
        this.props.logout();
    }


    handleLogin(){
        const username = document.getElementById('l_username_field').value;
        const password = document.getElementById('l_password_field').value;
    
        this.login(username, password);
    }

    handleSignUp(){
        const name = document.getElementById('su_name_field').value;
        const email = document.getElementById('su_email_field').value;
        const username = document.getElementById('su_username_field').value;
        const password = document.getElementById('su_password_field').value;
        const re_password = document.getElementById('su_re-password_field').value;

        if(password !== re_password){
            this.setState({...this.state, errorMsg: "Passwords do not match."});
            return;
        }

        if(password.length < 5){
            this.setState({...this.state, errorMsg: "Your password must be longer than 5 characters!"});
        }

        send('POST', '/accounts', [], {'name': name, 'email': email, 'username': username, 'password': password},
            (status, body) => {
                // console.log(status);
                // console.log(body);
                this.login(username, password);
            });
        
    }

    handleSubmit(){
        if(this.state.formType === "Login"){
            this.handleLogin();
        }else{
            this.handleSignUp();
        }
    }

    render(){
        return (
            <LoginForm display={this.state.display} title={this.state.formType} other={this.otherFormType()} submit={() => {this.handleSubmit()}}
                changeType={() => {this.setState({...this.state, formType: this.otherFormType(), errorMsg: ""})}}
                hide={() => {this.setState({...this.state, hide: !this.state.hide, formType: this.state.formType})}} isHiden={this.state.hide} 
                errorMsg={this.state.errorMsg} />
        );
    }
}

function LoginForm(props){
    if(props.isHiden === true){
        return (
            <div className="form-popup bottom-right" id="myForm">
                <div className="form-container">
                  <button className="show-button" onClick={() => {props.hide()}}>[Show]</button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-popup bottom-right" id="myForm">
            <div className="form-container">
                <h1 className="center">{props.title}</h1>
                <button className="hide-button" onClick={() => {props.hide()}}>[Hide]</button>

                <Fields title={props.title} errorMsgExists={props.errorMsg !== ""} />

                <ErrorMsg errorMsg={props.errorMsg} />
                <button className="btn" onClick={() => {props.submit()}}>Submit</button>
                <button className="btn-sign-up" onClick={() => {props.changeType()}}>{props.other}</button>
            </div>
        </div>
    );
}

function ErrorMsg(props){
    if(props.errorMsg === ""){
        return (<></>);
    }else{
        return (
            <p className="error-msg">{props.errorMsg}</p>
        );
    }
}

function Fields(props){
    const reduce_margin = props.errorMsgExists ? {"margin-bottom":"10px"} : {};

    if(props.title === "Login"){
        return (
            <>
            <label htmlFor="username"><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="username" id="l_username_field" required />

            <label htmlFor="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" id="l_password_field" style={reduce_margin} required />
            </>
        );
    }else{
        return (
            <>
            <label htmlFor="name"><b>Name</b></label>
            <input type="text" placeholder="Enter Name" name="name" id="su_name_field" required />

            <label htmlFor="email"><b>Email</b></label>
            <input type="text" placeholder="Enter Email" name="email" id="su_email_field" required />

            <label htmlFor="username"><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="username" id="su_username_field" required />

            <label htmlFor="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" id="su_password_field" style={{"margin-bottom":"10px"}} required />
            <input type="password" placeholder="Re-enter Password" name="re-password" id="su_re-password_field" style={reduce_margin} required />
            </>
        );
    }
}


export default Login;