import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

const JOKES = [
  'Why do programmers hate nature? It has too many bugs.',
  'A bug is just a feature that hasn\'t been documented yet.',
  'There are only 10 types of bugs in the world: the ones you find and the ones you don\'t.',
  'Why did the bug cross the road? It was attached to the chicken.',
  'Debugging: being the detective in a crime movie where you\'re also the murderer.',
  'The best way to fix a bug is to pretend it\'s a feature and update the docs.',
  'A bug in the code is worth two in the production.',
  '99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code.',
  'I don\'t have bugs, I have unexpected features.',
  'Why was the developer cold? There was too much draft in his code.',
];

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get()
  root() {
    return {
      joke: JOKES[Math.floor(Math.random() * JOKES.length)],
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }
}
