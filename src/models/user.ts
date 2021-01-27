import {Table, Column, Model, HasMany} from 'sequelize-typescript';
import jwt from 'jsonwebtoken';

@Table
export class User extends Model<User> {

    @Column
    username: string;

    @Column
    password: string;

    // validatePassword(password: string) {
    //     const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    //     return this.hash === hash;
    // }

    generateJWT() {
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        return jwt.sign({
            username: this.username,
            exp: expirationDate.getTime() / 1000,
        }, 'secret',);
    }

    toAuthJSON() {
        return {
            username: this.username,
            token: this.generateJWT(),
        };
    };
}