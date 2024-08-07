import { connectDB } from "../db/connection.js"
import categoryRouter from "./modules/categoty/category.router.js"
import subcategoryRouter from "./modules/subcategory/subcategory.router.js"
import { globalErrorHandling } from "./utils/appError.js"

export const initApp = (app, express) => {
    const port = process.env.PORT || 3000

    // connect to DB
    connectDB()

    //parse req
    app.use(express.json())
    app.use('/uploads', express.static('uploads'))
    app.use('/category', categoryRouter)
    app.use('/subcategory', subcategoryRouter)

    // global error
    app.use(globalErrorHandling)

    // listen on server
    app.listen(port, () => {
        console.log("server is running on port...", port);
    })

}