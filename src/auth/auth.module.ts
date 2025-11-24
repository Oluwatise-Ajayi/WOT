import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './supabase.strategy';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [SupabaseStrategy],
  exports: [SupabaseStrategy],
})
export class AuthModule {}
