import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'recipient'], required: true },
    recipientId: { type: String, unique: true, sparse: true },
    userId: { type: String, unique: true, sparse: true },
    age: { type: Number },
    name: { type: String },
    bloodType: { type: String }
});

export default mongoose.model('User', UserSchema);

