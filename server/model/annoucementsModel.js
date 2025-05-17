import { Schema, model } from "mongoose";

const announcementsSchema = new Schema({
    title: String,
    description: String,
});

const modele = model( "announcements", announcementsSchema);

export default modele;