import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'recipient'], required: true },
    recipientId: { type: String, unique: true, sparse: true }, // Unique for recipients
    userId: { type: String, unique: true, sparse: true }, // Unique for users
});

export default mongoose.model('User', UserSchema);

