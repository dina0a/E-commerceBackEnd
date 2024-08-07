// import modules
import express from 'express'
import { initApp } from './src/initApp.js'
import dotenv from 'dotenv'
import path from 'path'

// create server 
const app = express()
dotenv.config({ path: path.resolve('./config/.env') })
initApp(app, express)