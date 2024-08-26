// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import googleOauthConfig from '../config/google-oauth.config';
// import { ConfigType } from '@nestjs/config';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     @Inject(googleOauthConfig.KEY)
//     private _googleconfiguration: ConfigType<typeof googleOauthConfig>,
//     private readonly _logger = new Logger(GoogleStrategy.name),
//   ) {
//     super({
//       clientID: _googleconfiguration.clientId,
//       clientSecret: _googleconfiguration.clientId,
//       callbackURL: _googleconfiguration.callbackURL,
//       scope: ['email', 'profile'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ) {
//     this._logger.log('my profile in strategy', { profile });
//   }
