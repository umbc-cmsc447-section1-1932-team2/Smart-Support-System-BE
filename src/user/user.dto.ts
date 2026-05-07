import {
  //isEmail, //where did this come from???
  IsEmail,
  IsNotEmpty,
  IsOptional,
  //isString, //Where did this come from???
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class SignupDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password Must Be At Least 6 Characters' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  role?: Role;
}

export class UpdateProfileDto {
@IsOptional()
@IsEmail()
email?: string;

//Passowrd Confirmation, Must Verify Password Before Changing
@IsOptional()
@IsString()
@MinLength(6, { message: 'Password Must Be At Least 6 Characters'})
currentPassword?: string;

@IsOptional()
@IsString()
@MinLength(6, { message: 'New Password Must Be At Least 6 Characters'})
newPassword?: string;

@IsOptional()
@IsString()
phone?: string;
}