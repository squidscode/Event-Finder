const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const mongoose = require("./database/mongoose");
const auth = require('./auth');
const verify = require('./verify');

const Account = require('./database/models/account').model;
const Group = require('./database/models/group').model;
const port = 3000

// Allow 4200 to connect
app.use(cors());

// Use JSON to parse post requests
app.use(express.json());

/**
 *  We want to: Create, Update, ReadOne, ReadAll, Delete for Account, Plan
 */
/*

/**
 * GENERAL FUNCTIONS FOR AUTHORIZATION:
 */

function validate_user(req, res){
    if(req.get("Authorization") == null){
        res.status(400);
        res.send({});
        return false;
    }

    var auth_obj = auth.parse_basic_authorization(req.get("Authorization"));
    if(auth_obj == null){
        res.status(400);
        res.send({});
        return false;
    }

    if(!auth.is_admin(auth_obj.username, auth_obj.password) && auth_obj.username != req.params.username){
        res.status(401);
        res.send({"message": "Cannot change account information for a different user!"});
        return false;
    }

    var search = auth.is_admin(auth_obj.username, auth_obj.password) ? 
        {username: req.params.username} :
        {username: req.params.username, password: auth_obj.password};

    return search;
}

// --- Account : CREATE, UPDATE, READ-ALL-USERNAMES, READ-USER, DELETE ---
/**
 * GET '/accounts'
 * Gets the list of all of the usernames that are currently registered 
 * in the database.
 * 
 * RETURN: the array of usernames : String.
 */
app.get('/accounts', (req, res) => {
    if(req.get("Authorization") != null){ // authorization provided
        auth_str = req.get("Authorization");
        auth_obj = auth.parse_basic_authorization(auth_str);
        if(auth_obj != null){
            if(auth.is_admin(auth_obj.username, auth_obj.password)){
                Account.find({})
                    .then(accounts => res.send(accounts))
                    .catch((error) => console.log(error));
            }else{
                Account.findOne({"username":auth_obj.username, "password":auth_obj.password})
                    .then(account => {
                        if(account == null){
                            res.status(401);
                            res.send({"message": "Invalid username/password."});
                        }
                        
                        let sendAcc = {...account, plans: []};
                        res.send(sendAcc);
                    })
                    .catch(error => console.log(error));
            }
        }else{
            res.status(400);
            res.send({"message": "Invalid format."});
        }
    }else{ // If no authorization is provided, return an array of usernames
        Account.find({})
            .then(accounts => res.send(accounts.map(account => {return account.username})))
            .catch((error) => {
                console.log(error);
                res.status(500);
                res.send({});
            });
    }
    
    
});

/**
 * POST '/accounts' 
 * Adds a new account to the database (ie. "Sign Up").
 * 
 * Return: The json object representing the account.
 */
app.post('/accounts', (req, res) => {
    if(!verify.obj_contains(req.body, ["name","username","password"])){
        res.status(400);
        res.send({"message": "Password must have name, username, and password fields!"});
        return;
    }

    if(req.body.password.length < 5){
        res.status(400);
        res.send({"message": "Password must be at least 5 characters long!"});
        return;
    }

    if(Account.find({username : req.body.username}).length > 0){
        res.status(400);
        res.send({"message": "Username is already taken!"});
        return;
    }

    let acc = {
        'name': req.body.name, 
        'username': req.body.username,
        'password': req.body.password};

    if(req.body.email != undefined){
        acc.email = req.body.email;
    }


    (new Account(acc))
        .save()
        .then((account) => res.send(account))
        .catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

function get_public_account(account){
    var pub_acc = {"username" : account.username};
    if(!verify.obj_contains(account, ["public_info_map"])){
        return pub_acc;
    }else{
        for(let bool_var in account.public_info_map){
            let x = bool_var.split("_")[0];
            if(account.public_info_map[bool_var]){
                pub_acc[x] = account[x];
            }
        }
        return pub_acc;
    }
}

/**
 * GET '/accounts/:username'
 * 
 * Gets all information marked public for the given account.
 */
app.get('/accounts/:username', (req, res) => {
    Account.find({username: req.params.username})
        .then(accounts => {
            var public_account = get_public_account(accounts[0]);
            delete public_account["$isNew"];
            res.send(public_account)
        })
        .catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

/**
 * PATCH '/accounts/:username'
 * 
 * Changes the account information IF the user is an admin OR if the user that is
 * logged in has the same username as the one we wish to change. 
 */
app.patch('/accounts/:username', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOneAndUpdate(search, {$set: req.body})
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
            }else{
                res.send(account);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(400);
            res.send({});
        });
});

/**
 * DELETE '/accounts/:username'
 * 
 * Attempts to delete the account with the given username. If the authentication 
 * allows it, the deletion will go through, otherwise it will not allow the user to
 * delete the user.
 */
app.delete('/accounts/:username', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOneAndDelete(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
            }else{
                res.send(account);
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

// --- FRIEND: ADD-FRIEND (Send Friend Request), REJECT-FRIEND-REQUEST, ACCEPT-FRIEND-REQUEST, UNFRIEND ---
app.get('/:username/friend', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            res.send({friends: account.friends, friend_requests: account.friend_requests});
        })
        .catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

// Send and accept friend request:
app.post('/:username/friend', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    if(req.body.username === req.params.username){
        res.status(400);
        res.send({"message": "Cannot send friend request to yourself!"});
        return;
    }

    Account.findOne(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(!verify.obj_contains(req.body, ["username"])){
                res.status(400);
                res.send({"message": "Body must have username field."});
                return;
            }

            if(Account.find({username : req.body.username}).length == 0){
                res.status(400);
                res.send({"message": "Username does not exist!"});
                return;
            }

            if(account.friends.findIndex((username => username === req.body.username)) !== -1){
                res.send({"message": "User is already a friend."});
                return;
            }

            Account.findOne({"username":req.body.username})
                .then((friend) => {
                    if(friend === null){
                        res.status(400);
                        res.send({"message": "User does not exist."});
                        return;
                    }

                    let ind = account.friend_requests.findIndex((username) => username === req.body.username);

                    if(ind !== -1){
                        account.friend_requests = [...account.friend_requests.slice(0, ind), ...account.friend_requests.slice(ind+1)];
                        friend.friends.push(account.username);
                        account.friends.push(friend.username);
                        account.save()
                        .catch(() => {res.status(400).send({})});
                        friend.save()
                        .catch(() => {res.status(400).send({})});
                        res.send({});
                        return;
                    }

                    if(friend.friend_requests.findIndex((username) => username === account.username) === -1){
                        friend.friend_requests.push(req.params.username);
                    }else{
                        res.send({"message": "Friend request already sent."});
                        return;
                    }
                    
                    friend.save()
                    .catch(() => {res.status(400).send({})});;
                    account.save()
                    .catch(() => {res.status(400).send({})});;

                    res.send({});
                }).catch((error) => {
                    console.log(error);
                    res.status(500);
                    res.send({});
                });
            
        })
        .catch((error) => {
            console.log(error);
            res.status(500);s
            res.send({});
        });
});

// Delete friend request AND/OR delete friend
app.delete('/:username/friend', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(!verify.obj_contains(req.body, ["username"])){
                res.status(400);
                res.send({"message": "Body must have username field."});
                return;
            }

            if(Account.find({username : req.body.username}).length == 0){
                res.status(400);
                res.send({"message": "Username does not exist!"});
                return;
            }

            if(account.friends.findIndex((username => username === req.body.username)) !== -1){
                Account.findOne({"username":req.body.username})
                    .then(friend => {
                        let acc_ind = account.friends.findIndex(username => username === friend.username);
                        let fri_ind = friend.friends.findIndex(username => username === account.username);
                        account.friends = [...account.friends.slice(0, acc_ind), ...account.friends.slice(acc_ind + 1)];
                        friend.friends = [...friend.friends.slice(0, fri_ind), ...friend.friends.slice(fri_ind + 1)];
                        account.save()
                        .catch(() => {res.status(400).send({})});;
                        friend.save()
                        .catch(() => {res.status(400).send({})});;
                        res.send({});
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500);
                        res.send({});
                    });

                if(account.friend_requests.findIndex(username => username === req.body.username) !== -1){
                    let acc_ind = account.friend_requests.findIndex(username => username === req.body.username);
                    account.friend_requests = [...account.friend_requests.slice(0, acc_ind), ...account.friend_requests.slice(acc_ind + 1)];
                    account.save()
                    .catch(() => {res.status(400).send({})});;
                    res.send({});
                    return;
                }
                
                return;
            }

            if(account.friend_requests.findIndex(username => username === req.body.username) !== -1){
                let acc_ind = account.friend_requests.findIndex(username => username === req.body.username);
                account.friend_requests = [...account.friend_requests.slice(0, acc_ind), ...account.friend_requests.slice(acc_ind + 1)];
                account.save()
                .catch(() => {res.status(400).send({})});;
                res.send({});
                return;
            }

            res.send({});
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        })
});

// --- PLAN : CREATE, UPDATE, READ-ALL-PUBLIC-PLANS, READ-PLAN, DELETE ---
const MAX_PLANS = 500;
const PLAN_PER_ACCOUNT = 5;
app.get('/plans', (req, res) => {
    var plan_array = [];

    Account.find({})
        .then((accounts) => {
            for(let ind in accounts){
                let account = accounts[ind];
                if(account.plans == undefined) break;
                let added = 0;
                for(let i = account.plans.length - 1; i >= 0; --i){
                    let plan = account.plans[i].toObject();
                    plan.owner = account.username;
                    if(plan.public){
                        plan_array.push(plan);
                        added++;
                        if(PLAN_PER_ACCOUNT <= added || MAX_PLANS <= plan_array.length){
                            break;
                        }
                    }else if(plan.completed){
                        break;
                    }
                }
                if(MAX_PLANS <= plan_array.length)
                    break;
            }

            res.send(plan_array);
        })
        .catch(error => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

const PAGE_SIZE = 50;
app.get('/:username/plans/:page_num', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then((account) => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }
            let page_num = req.params.page_num;

            res.send(account.plans.slice(PAGE_SIZE*(page_num - 1), PAGE_SIZE*page_num));
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

app.get('/:username/friend-plans', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;
    var plan_array = [];

    Account.findOne(search)
        .then((account) => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            Account.find({username: account.friends})
                .then((accounts) => {
                for(let ind in accounts){
                    let account = accounts[ind];
                    if(account.plans == undefined) break;
                    let added = 0;
                    for(let i = account.plans.length - 1; i >= 0; --i){
                        let plan = account.plans[i].toObject();
                        plan.owner = account.username;
                        if(plan.completed){
                            break;
                        }else{
                            plan_array.push(plan);
                            added++;
                            if(PLAN_PER_ACCOUNT <= added || MAX_PLANS <= plan_array.length){
                                break;
                            }
                        }
                    }
                    if(MAX_PLANS <= plan_array.length)
                        break;
                }

                res.send(plan_array);
            }).catch((error) => {
                console.log(error);
                res.status(500);
                res.send({});
            });
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

app.post('/:username/plans', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then((account) => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(!verify.obj_contains(req.body, ["title", "time"])){
                res.status(400);
                res.send({"message": "Every plan must have a title & time."});
                return;
            }

            req.body.index = account.plans.length;
            
            account.plans.push(req.body);
            account.save()
            .catch(() => {res.status(400).send({})});;
            
            res.send(req.body);
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

app.patch('/:username/plans/:plan_index', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;
    let plan_index = req.params.plan_index;

    if(isNaN(Number(plan_index))){
        res.status(400);
        res.send({"message": "Plan index must be a number"});
        return;
    }

    plan_index = Number(plan_index);

    Account.findOne(search)
        .then((account) => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(plan_index >= account.plans.length || plan_index < 0){
                res.status(400);
                res.send({"message": "Invalid plan index."});
                return; 
            }

            plan = account.plans.at(plan_index);
            for(let arg in req.body){
                plan[arg] = req.body[arg];
            }
            account.save()
            .catch(() => {res.status(400).send({})});;

            res.send(plan);
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

app.delete('/:username/plans/:plan_index', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;
    let plan_index = req.params.plan_index;

    if(isNaN(Number(plan_index))){
        res.status(400);
        res.send({"message": "Plan index must be a number"});
        return;
    }

    plan_index = Number(plan_index);

    Account.findOne(search)
        .then((account) => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(plan_index >= account.plans.length || plan_index < 0){
                res.status(400);
                res.send({"message": "Invalid plan index."});
                return; 
            }

            for(let ind = plan_index + 1; ind < account.plans.length; ++ind){
                --account.plans[ind].index;
            }

            account.plans = account.plans.slice(0,plan_index)
                .concat(account.plans.slice(plan_index + 1));
            account.save()
            .catch(() => {res.status(400).send({})});;

            res.send();
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send({});
        });
});

// --- GROUP : CREATE, UPDATE, READ-ALL-PUBLIC-GROUPS, READ-PLAN, DELETE ---
app.post('/:username/groups', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect username/password provided."});
                return;
            }

            req.body["owner"] = search.username;

            if(!verify.obj_contains(req.body, ["name", "owner"])){
                res.status(400);
                res.send({"message": "Body must contain name."});
                return;
            }

            (new Group(req.body))
                .save()
                .then(group => {
                    res.send(group);
                }).catch(error => {
                    console.log(error);
                    res.status(500);
                    res.send({});
                });
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

app.patch('/:username/groups/:group_id', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            if(account == null){
                res.status(401);
                res.send({"message": "Incorrect password provided."});
                return;
            }

            if(account.group_ids.find((id) => {return id == req.params.group_id;}) == undefined){
                res.status(401);
                res.send({"message": "This user does not belong to the group."});
                return;
            }

            Group.findOneAndReplace({"_id":req.params.group_id, "owner":req.params.username}, {"$set":res.body})
                .then((group) => {
                    if(group == null){
                        res.status(401);
                        res.send({"message": "Group does not exist or user is not the owner."});
                        return;
                    }

                    res.send(group);
                })
                .catch(error => {
                    console.log(error);
                    res.status(500);
                    res.send({}); 
                });
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

app.get('/groups', (req, res) => {
    Group.find({})
        .then(groups => {
            res.send(groups);
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

app.get('/:username/groups', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            res.send(account.group_ids);
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

app.get('/:username/groups/:group_id', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            res.send(account.groups.findOne({"_id":req.params.group_id}));
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

app.delete(':username/groups/:group_id', (req, res) => {
    var search = validate_user(req, res);
    if(search == false) return;

    Account.findOne(search)
        .then(account => {
            res.send(account.groups.findOneAndDelete({"_id":req.params.group_id}));
        }).catch(error => {
            console.log(error);
            res.status(500);
            res.send({}); 
        });
});

// https.createServer({
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.cert')
//   }, app).listen(3000, () => {
//     console.log('Listening...')
//   });

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })