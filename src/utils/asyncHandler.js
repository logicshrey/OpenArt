
const asyncHandler = (fn) => {
    return async (req,res) => {
        try {
            await fn(req,res)
        } catch (error) {
            console.log("Error: ",error);
            throw error
        }
    }        
}

export { asyncHandler }