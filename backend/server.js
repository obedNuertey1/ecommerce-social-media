import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import {getPgVersion, sql} from "./config/db.js";
import {aj} from "./lib/arcjet.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(cors({origin: "*"}));
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan("dev"));

app.use(async (req, res, next)=>{
    try{
        const decision = await aj.protect(req, {requested: 1});

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({error: "Too many requests"});
            }else if(decision.reason.isBot()){
                res.status(403).json({error: "Bot access denied"});
            }else{
                res.status(403).json({error: "Forbidden"});
            }
            return;
        }
        if(decision.results.some(result => result.reason.isBot() && result.reason.isSpoofed())){
            res.status(403).json({error: "Spoofed bot detected"});
            return;
        }
        next();
    }catch(e){
        console.error(e.message);
        res.status(500).json({error: `Internal server error: ${e.message}`});
        next(e);
    }
})

app.use("/api/products", productRoutes);

async function initDB(){
    try{
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `
        console.log("DB initialized successfully");
    }catch(e){
        console.error(e.message);
    }
}

initDB().then(()=>{
    app.listen(PORT, async ()=>{
        await getPgVersion();
        console.log(`Server is running on port ${PORT}`);
    })
}).catch((e)=>{
    console.error(e.message);
})
