import UserModel from "../model/annoucementsModel.js";

const findItems = async () => {
    const item = await UserModel.find({});
    return item;  
}

export { findItems };
