import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "✅ Backend connected to React successfully!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));






// import express from 'express'
//import { searchController, usernameController } from './controller.js'
//import { userLogin, userSignup } from './controller.js'
//import router from './route.js'
// import multer from 'multer'
// import {storage} from './config/multer.js'
//import dotenv from 'dotenv';

//dotenv.config();


// const app = express()
// const PORT = 3000

// app.use('/welcome',(req,res,next)=>{
//     console.log('A new request received at'+Date.now())
//     next()
// })

// app.use((req,res,next)=>{
//     console.log('Start')

//     res.on('finish',()=>{
//         console.log('End')
//     })

//     next()
// })

// app.use(express.urlencoded({extended:true}))
// app.use(upload.single('image'))

// Define a simple route
// app.get('/', (req,res)=>{
//     //console.log('Middle')
//     res.send('Hello, Express')
// })

//app.use(express.json());

// Fetch all users
// app.get('/users', async (req, res) => {
//   const { data, error } = await supabase.from('users').select('*');
//   if (error) return res.status(500).json({ error: error.message });
//   res.json(data);
// });

// Add a new user
// app.post('/users', async (req, res) => {
//   const { name, email } = req.body;
//   const { data, error } = await supabase.from('users').insert([{ name, email }]);
//   if (error) return res.status(500).json({ error: error.message });
//   res.status(201).json(data);
// });


// app.post('/form',(req,res)=>{
//     console.log(req.body)
//     console.log(req.file);
//     res.send('Form Received')
// })

// app.get('/error',()=>{
//     throw new Error('This is test error')
// })

// app.use((err,req,res,next)=>{
//     console.error(err.message)
//     res.send('Internal server error')
// })

// app.get('/welcome', (req,res)=>{
//      res.send('Welcome to Express')
// })

// // About route
// app.get('/about', (req,res)=>{
//     res.send('This is about route')
// })

// // About route
// app.get('/contact', (req,res)=>{
//     res.send('This is contact route')
// })

// app.get('/user/:username',usernameController)

// app.get('/search',searchController)

// app.get('/user/login',userLogin)
// app.get('/user/signup',userSignup)

// app.use('/user',router)

// app.use(express.json())

// app.post('/users', (req,res)=>{
//     const { name, email } = req.body
//     res.json({
//         message: `User ${name} with email ${email} created successfully`
//     })
// })

// app.put('/users/:id', (req,res)=>{
//     const userId = req.params.id
//     const {name,email} = req.body
//     res.json({
//         message:`User ${userId} updated to ${name}, ${email}`
//     })
// })

// app.delete('/users/:id', (req,res)=>{
//     const userId = req.params.id
//     res.json({
//         message: `User with ID ${userId} deleted successfully`
//     })
// })

// // /users/name/id
// app.get('/things/:name/:id([0-9]{5})', (req,res)=>{
//     const {name, id} = req.params
//     res.json({
//         id,
//         name
//     })
// })

// // Catch-all invalid routes
// app.get('*',(req,res)=>{
//     res,send('Sorry, this is an invalid URL.')
// })

// app.listen(PORT,()=>{
//     console.log(`Server is running on http://localhost:${PORT}`)
// })