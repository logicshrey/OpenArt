
const asyncHandler = (fn) => {
    return async (req,res,next) => {
        try {
            await fn(req,res)
        } catch (error) {
            console.log("Error: ",error);
            next(error);
            // throw error
        }
    }        
}

export { asyncHandler }