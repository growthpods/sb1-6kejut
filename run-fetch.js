import { execa } from 'execa';

async function run() {
  try {
    const { stdout, stderr } = await execa('npx', ['ts-node', '--esm', '--experimental-specifier-resolution=node', 'scripts/fetchAndClassifyJobs.ts']);
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error(error);
  }
}

run();
