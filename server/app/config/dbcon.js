const mongoose=require ("mongoose")


const dbcon=async()=>{
    const db=mongoose.connect(process.env.mongodb_url)
    try{
        if(db){
            console.log("connected.....")
        }
        }catch(error){
            console.log("error....")
    }
}
module.exports=dbcon