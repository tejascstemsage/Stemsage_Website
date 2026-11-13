import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

const adminDist = resolve('admin/dist');
const targetDir = resolve('frontend/dist/admin');

cpSync(adminDist, targetDir, { recursive: true, force: true });
console.log(`Copied ${adminDist} -> ${targetDir}`);