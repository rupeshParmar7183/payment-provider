import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [SequelizeModule.forFeature([User]),
  // JwtModule.register({
  //     secret: process.env.JWT_SECRET,
  //     signOptions: {
  //       expiresIn: '1d',
  //     },
  //   }),

  JwtModule.registerAsync({
    inject: [ConfigService],

    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),

      signOptions: {
        expiresIn: '1d',
      },
    }),
  }),
  PassportModule.register({ defaultStrategy: 'jwt' })

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }