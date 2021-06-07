import User from "../models/User";
import bcrypt from "bcrypt"
import fetch from "node-fetch"

export const userDelete = (req,res) => {
    res.render("");
}

export const getUserEdit = async(req,res) =>{
    console.log(req.locals,res.locals);
    return res.render("edit-profile",{pageTitle:"Edit Profile"})
}
export const postUserEdit = async (req, res) => {
    const {
        session: {
            user: {
                _id
            }
        },
        body: {
            email,
            username,
            name,
            location
        }
    } = req;
    
    const prevUser = req.session.user;

    //변경되는 유저 데이터 상태들.
    let changeState = [];
    prevUser.email !== email ? changeState.push({email}):false;
    prevUser.username !== username ? changeState.push({username}):false;
    
    if(changeState.length > 0){
        const exists = await User.exists({$or: changeState.map(state => state)})
        if(exists) {
            return res.status(400).render("edit-profile",{pageTitle:"Edit Profile", errorMessage:"변경할 값이 이미 존재합니다!"})
        }
    }

    //new:true 옵션으로 업데이트한 데이터 반환
    const updateUser = await User.findByIdAndUpdate(_id, {
        email,
        username,
        name,
        location
    },{new:true});

    req.session.user = updateUser;

    res.redirect('/users/edit')
}

export const userDetail = (req,res) =>{
    res.send('userDetail');
}

export const userLogout = (req,res) =>{
    req.session.destroy();
    return res.redirect("/")
}

export const getJoin = (req,res) =>{
    res.render("join",{pageTitle:"User Create"})
}

export const postJoin = async(req,res) =>{
    const {name, username, email, password, password2, location} = req.body;
    const exists = await User.exists({$or :[{username},{email}]});

    if(password !== password2){
        return res.render("join",{
            pageTitle:"Join",
            errorMessage:"비밀번호가 다릅니다."
        })
    }

    if(exists){
        return res.status(400).render("join",{pageTitle:"Join", errorMessage:"이미 있는 아이디거나 이메일 입니다."})
    }
    try{
        await User.create({
            email,
            username,
            password,
            name,
            location
        });
        res.redirect("/login")
    }catch(err){
        return res.status(400).render("join",{pageTitle:"Join", errorMessage:err._message})
    }

;}

export const getLogin = (req,res) =>{
    res.render("login", {pageTitle:"Login"})
}

export const postLogin = async(req,res) =>{
    const {email, password} = req.body;
    const user = await User.findOne({email, socialOnly: false});
    if(!user){
        return res.status(400).render("login",{pageTitle:"Login", errorMessage:"아이디가 존재하지 않습니다!"});
    }
    console.log(user);
    console.log(password ,user.password);
    const ok = await bcrypt.compare(password ,user.password);

    if(!ok){
        return res.status(400).render("login",{pageTitle:"Login", errorMessage:"비밀번호가 틀립니다!"});
    }

    req.session.loggedIn =true;
    req.session.user = user;
    console.log("User Login : ", user.email);
    res.redirect("/");
}

export const startGithubLogin = (req,res) =>{
    const baseURL = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:"613be12976c2ec72c663",
        scope:"read:user user:email"
    }
    const finURL = `${baseURL}?${new URLSearchParams(config).toString()}`;
    return res.redirect(finURL);
}

export const finishGithubLogin = async(req,res) =>{
    const baseURL = "https://github.com/login/oauth/access_token";

    const config = {
        client_id: process.env.GITHUB_CILENT,
        client_secret: process.env.GITHUB_SECRET,
        code: req.query.code
    }
    const finURL = `${baseURL}?${new URLSearchParams(config).toString()}`
    const fetchOption = {
        method:"POST",
        headers:{
            Accept:"application/json"
        }
    }
    const json = await (await fetch(finURL,fetchOption)).json();
    
    if("access_token" in json){
        const{access_token} = json;
        const apiURL = "https://api.github.com";
        const apiOption = {
            headers:{
                method:"GET",
                Authorization:`token ${access_token}` 
            }
        }

        const userData = await (await fetch(`${apiURL}/user`,apiOption)).json();
        console.log(userData);

        const emailData =await (await fetch(`${apiURL}/user/emails`,apiOption)).json();
        console.log(emailData);
        
        const emailObj = emailData.find(email => email.primary === true && email.verified === true)
        
        if(emailObj){
            const existingUser = await User.findOne({email: emailObj.email});
            if(!existingUser){
                await User.create({
                    email:emailObj.email,
                    socialOnly:true,
                    avatarURL:userData.avatar_url,
                    username:userData.login,
                    password:"",
                    name:userData.name,
                    location:userData.location,
                })
            }

            req.session.loggedIn =true;
            req.session.user = existingUser;
            return res.redirect("/")
            
        }else{
            return res.redirect("/login")
        }
        
    }else{
        return res.redirect("/login");
    }
}