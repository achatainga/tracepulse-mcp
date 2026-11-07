#!/usr/bin/env node
import { TracePulseEngine } from '../src/engine.mjs';

const engine = new TracePulseEngine();
const samples = [16.1, 16.4, 45.2, 16.2, 85.0];
console.log(JSON.stringify(engine.computeFpsScore(samples), null, 2));
