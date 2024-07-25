const express =require('express')
const mongoose= require('mongoose')
const bcrypt=require('bcrypt')
const cors=require('cors')
const jwt=require('jsonwebtoken')
const userModel=require("./models/users")
const postModel = require('./models/posts')


let app=express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://ashna:ashna@cluster0.n9qo4.mongodb.net/blogAppDB?retryWrites=true&w=majority&appName=Cluster0")



//create a post
app.post("/create",async(req,res)=>{
    let input=req.body
    let token=req.headers.token
    jwt.verify(token,"blogapp",async(error,decoded)=>{
        if (decoded && decoded.email) {
            let result=new postModel(input)
            await result.save()
            res.json({"status":"success"})


            
        } else {
            res.json({"status":"invalid authentication"})
            
        }
    })
})

//view post
app.post("/view",async(req,res)=>{
    let token=req.headers.token
    jwt.verify(token,"blogapp",async(error,decoded)=>{
        
        if (decoded && decoded.email) {
           postModel.find().then(
            (items)=>{
                res.json(items)
            }
           ).catch(
            (error)=>{
                res.json({"status":"error"})
            }
           )


            
        } else {
            res.json({"status":"invalid authentication"})
            
        }
    })


})
    
//signin
app.post("/signIn",async(req,res)=>{
    let input =req.body
    let result=userModel.find({email:req.body.email}).then(
        (items)=>{
            if (items.length>0)
            {
                const passwordvalidator=bcrypt.compareSync(req.body.password,items[0].password)
                if (passwordvalidator) {
                    jwt.sign({email:req.body.email},"blogapp",{expiresIn:"1d"},(error,token)=>{
                        if (error) {
                            res.json({"status":"error","errorMessage":error})

                            
                        } else {
                            res.json({"status":"success","token":token,"userId":items[0]._id})
                            
                        }
                    })
                    
                } else {
                    res.json({"status":"Incorect password"})


                    
                }
            }
            else{
                res.json({"status":"invalid email id "})

            }
        }
    ).catch()
})

//signup
app.post("/signUp",async(req,res)=>{
   let input=req.body
   let hashedPassword= bcrypt.hashSync(req.body.password,10)
   req.body.password=hashedPassword

   userModel.find({email:req.body.email}).then(
    (items)=>{
        if(items.length>0){
            res.json({"status":"email id already exist"})
        }
        else{
            let result=new userModel(input)
            result.save()
            res.json({"status":"success"})
        }
    }
   ).catch(
    (error)=>{}
   )

        
  

})
app.listen(3030,()=>{
    console.log("server started")
})
