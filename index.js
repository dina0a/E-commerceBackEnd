// import modules
import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import schedule from 'node-schedule'
import { initApp } from './src/initApp.js'
import { User } from './db/index.js'
import { status } from './src/utils/constant/enums.js'
// create server 
const app = express()
schedule.scheduleJob('1 1 1 * * *', async function () {
    const users = await User.find({ status: status.PENDING, createdAt: { $lte: Date.now() - 30 * 24 * 60 * 60 * 1000 } }).lean()
    const userIds = users.map((user) => { return user._id })
    await User.deleteMany({ id: { $in: userIds } })
})
schedule.scheduleJob('1 1 1 * * *', async function () {
    const users = await User.find({ status: status.DELETED, updatedAt: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 })
    // todo complete this
})


dotenv.config({ path: path.resolve('./config/.env') })
initApp(app, express)