const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    loginHistory: [{
        dateTime: { type: Date },
        userAgent: { type: String },
    }],
});

let User; 

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://kmanuja:WRV0VKr16nekoADS@cluster0.vttnlkv.mongodb.net/");

        db.on('error', (err)=>{
            console.log("Unable to connect to Mongo DB ", err);
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
}

module.exports.registerUser = function(userData) {
    let p1 = userData.password;
    let p2 = userData.password2;
    return new Promise((resolve, reject) => {
        if (p1 !== p2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(p1, 10).then( hash => {
                userData.password = hash;
                const newUser = new User(userData);

                newUser.save()
                    .then(data => resolve(data))
                    .catch(err => {
                        if (err.code === 11000)
                            reject("User Name is already taken");
                        else
                            reject("Error occurred while registration: " + err);
                    })
            })
        }
    })
}

module.exports.checkUser = function(userData) {
    let uName = userData.userName;
    let uAg = userData.userAgent;
    let p1 = userData.password;

    return new Promise((resolve, reject) => {
        User.find(
            {userName: uName}
        ).then(data => {
            if (data.length >0) {
                currentUser = data[0];
                bcrypt.compare(p1, currentUser.password)
                    .then( result => {
                        if (result) {
                            let loginDetails = {
                                dateTime: new Date().toString(),
                                userAgent: uAg,
                            };
                            currentUser.loginHistory.push(loginDetails);
                            User.updateOne(
                                {userName: currentUser.userName},
                                {$set: { loginHistory: currentUser.loginHistory }}
                            ).then(() => resolve(currentUser))
                            .catch(err => {
                                reject("There was an error verifying the user: " + err);
                            })
                        } else
                            reject("Incorrect password for user: " + uName);
                }).catch(err => {
                    console.log("An error occurred whilte authenticating the user: ", err);
                    reject("Unable to find user: " + uName);
                })
            } else
                reject("Unable to find user: " + uName);
        }) 
    })

}