import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  private supabase: SupabaseClient;
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });

    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_KEY') ?? '',
    );
  }

  async validate(payload: any) {
     if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Validate required claims in JWT
    if (!payload.sub) {
      throw new UnauthorizedException('Token missing user ID (sub claim)');
    }

    // Validate token expiration (ignoreExpiration: false should handle this, but explicit check for clarity)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    // Check if user exists in auth.users (this verifies the user hasn't been deleted)
    const { data: user, error } = await this.supabase.auth.admin.getUserById(
      payload.sub,
    );

    if (error || !user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate user email is confirmed (optional but recommended for production)
    // if (!user.user_metadata?.email_verified && user.email_confirmed_at === null) {
    //   throw new UnauthorizedException('Email not verified');
    // }
    // Here we can add more validation if needed, e.g. checking if user exists in Supabase
    // For now, we just return the payload which contains the user ID (sub)
    // if (!payload) {
    //     throw new UnauthorizedException();
    // }
    return payload;
  }
}
